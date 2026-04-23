import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useAddressSuggestQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useGetUsersQuery,
} from "@api";
import { useT } from "@hooks";
import {
  useManageOfficeForm,
  DEFAULT_INTERVAL,
  type DayEntryType,
  type ManageOfficeFormValues,
} from "../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { DAYS, UserRole } from "@clinio/shared";
import { CreateOfficeDto, Office } from "@clinio/api";
import { DEBOUNCE_MS } from "../../constants.ts";
import { ROUTER_PATHS } from "@router";
import { CAP_WORK_DAYS, CAP_DAYS } from "../../components/utils/types.ts";

const INITIAL_DAYS: DayEntryType[] = CAP_DAYS.map((day) => ({
  key: day.toLowerCase(),
  checked: CAP_WORK_DAYS.includes(day),
  intervals: [{ ...DEFAULT_INTERVAL }],
}));

export type OfficeDetailFormReturn = ReturnType<typeof useOfficeDetailForm>;

export function useOfficeDetailForm(
  office: Office | null | undefined,
  editing: boolean,
  isNew: boolean,
  stopEdit: () => void
) {
  const t = useT();
  const navigate = useNavigate();
  const { mutate: updateOffice, isPending: isUpdating } =
    useUpdateOfficeMutation();
  const { mutate: createOffice, isPending: isCreating } =
    useCreateOfficeMutation();

  const { data: users = [] } = useGetUsersQuery([
    UserRole.NURSE,
    UserRole.DOCTOR,
  ]);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addressValue, setAddressValue] = useState("");
  const [watchedStaffIds, setWatchedStaffIds] = useState<string[]>([]);
  const [mapPosition, setMapPosition] = useState<{
    lon: number;
    lat: number;
  } | null>(null);

  const form = useManageOfficeForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      specialization: "",
      address: "",
      days: isNew ? INITIAL_DAYS : [],
      staffIds: [],
    },
    validate: {
      name: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      specialization: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      address: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      days: {
        intervals: {
          from: (
            value: number | null,
            values: ManageOfficeFormValues,
            path: string
          ) => {
            const dayIndex = Number(path.split(".")[1]);
            return values.days[dayIndex].checked && value == null
              ? t("common.validation.required")
              : null;
          },
          to: (
            value: number | null,
            values: ManageOfficeFormValues,
            path: string
          ) => {
            const dayIndex = Number(path.split(".")[1]);
            return values.days[dayIndex].checked && value == null
              ? t("common.validation.required")
              : null;
          },
        },
      },
    },
  });

  // `form.watch` uses `useEffect` internally, so it must be called at the
  // top level of this hook — not inside another effect.
  form.watch("address", ({ value }) => {
    setAddressValue(value);
  });
  form.watch("staffIds", ({ value }) => {
    setWatchedStaffIds(value);
  });
  const [debouncedAddress] = useDebouncedValue(addressValue, DEBOUNCE_MS);
  const { data: suggestions = [] } = useAddressSuggestQuery(
    editing ? debouncedAddress : ""
  );

  const handleAddressSelect = (value: string) => {
    const match = suggestions.find((s) => `${s.name}, ${s.location}` === value);
    setMapPosition(match?.position ?? null);
  };

  // `form` is omitted from deps intentionally — it is a stable ref (uncontrolled mode)
  // and including it would cause infinite re-render loops.
  const populateFromOffice = useCallback(() => {
    if (!office) return;
    const hours = office.officeHoursTemplate as Record<
      string,
      Array<{ from: number; to: number }>
    > | null;

    const mappedDays = DAYS.map((day) => {
      const dayIntervals = hours?.[day] ?? [];
      if (dayIntervals.length === 0) {
        return {
          key: day,
          checked: false,
          intervals: [{ from: null, to: null }],
        };
      }
      return {
        key: day,
        checked: true,
        intervals: dayIntervals.map((slot) => ({
          from: slot.from,
          to: slot.to,
        })),
      };
    });

    form.setValues({
      name: office.name,
      specialization: office.specialization,
      address: office.address,
      staffIds: office.staffIds,
      days: mappedDays,
    });
    setMapPosition(null);
  }, [office]);

  // Populate form whenever office data loads or changes, but never while the
  // user is mid-edit — otherwise a background refetch would wipe their edits.
  useEffect(() => {
    if (!office || isNew || editing) return;
    populateFromOffice();
  }, [office, isNew, editing, populateFromOffice]);

  const handleCancel = () => {
    setSelectedUserId(null);
    setSelectedRole(null);
    setMapPosition(null);
    if (isNew) {
      navigate(ROUTER_PATHS.OFFICES);
    } else {
      // Flipping editing → false re-runs the populate effect, which rehydrates
      // the form from the latest office data. No explicit reset needed here.
      stopEdit();
    }
  };

  const handleSave = () => {
    const result = form.validate();
    if (result.hasErrors) return;

    const { days, ...rest } = form.getValues();
    const officeHoursTemplate = Object.fromEntries(
      days.map(({ key, checked, intervals }) => [
        key,
        checked
          ? intervals.filter(
              (i): i is { from: number; to: number } =>
                i.from != null && i.to != null
            )
          : [],
      ])
    ) as CreateOfficeDto["officeHoursTemplate"];

    const dto = { ...rest, officeHoursTemplate };

    if (isNew) {
      createOffice(dto, {
        onSuccess: (created) => {
          stopEdit();
          navigate(ROUTER_PATHS.OFFICE_DETAIL_ID(created.id), {
            replace: true,
          });
        },
      });
    } else if (office) {
      updateOffice(
        { path: { id: office.id }, body: dto },
        { onSuccess: () => stopEdit() }
      );
    }
  };

  // --- Personnel helpers ---
  const handleAddStaff = () => {
    if (!selectedUserId) return;
    form.insertListItem("staffIds", selectedUserId);
    setSelectedUserId(null);
  };

  const handleRemoveStaff = (index: number) => {
    form.removeListItem("staffIds", index);
  };

  const roleSelectData = useMemo(
    () => [
      { value: UserRole.NURSE, label: UserRole.NURSE },
      { value: UserRole.DOCTOR, label: UserRole.DOCTOR },
    ],
    []
  );

  const handleRoleChange = (role: string | null) => {
    setSelectedRole(role);
    setSelectedUserId(null);
  };

  const userSelectData = useMemo(() => {
    return users
      .filter(
        (u) =>
          !watchedStaffIds.includes(u.id) &&
          (!selectedRole || u.role === selectedRole)
      )
      .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));
  }, [users, selectedRole, watchedStaffIds]);

  return {
    form,
    users,
    isPending: isNew ? isCreating : isUpdating,
    suggestions,
    mapPosition,
    selectedRole,
    selectedUserId,
    roleSelectData,
    userSelectData,
    handleAddressSelect,
    handleCancel,
    handleSave,
    handleAddStaff,
    handleRemoveStaff,
    watchedStaffIds,
    handleRoleChange,
    setSelectedUserId,
  };
}
