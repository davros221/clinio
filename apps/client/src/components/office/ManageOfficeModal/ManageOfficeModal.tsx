import {
  Modal,
  TextInput,
  Table,
  Group,
  Stack,
  Title,
  Select,
  Button,
  Box,
  Autocomplete,
  Fieldset,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useGetUsersQuery } from "../../../api/userService.ts";
import { DAYS, UserRole } from "@clinio/shared";
import { CAP_WORK_DAYS, CAP_DAYS } from "../../utils/types.ts";
import { MapPreview } from "../../MapPreview";
import {
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
} from "../../../api/officeService.ts";
import { CreateOfficeDto, Office } from "@clinio/api";
import { ManageOfficeModalDayRow } from "./ManageOfficeModalDayRow.tsx";
import { useT } from "../../../hooks/useT";
import { useUserRole } from "../../../hooks/useUserRole.ts";
import { ParseKeys } from "i18next";
import {
  ManageOfficeFormProvider,
  useManageOfficeForm,
  DEFAULT_INTERVAL,
  type DayEntryType,
  type ManageOfficeFormValues,
} from "./ManageOfficeFormContext";
import { useDebouncedValue } from "@mantine/hooks";
import { useAddressSuggestQuery } from "../../../api/addressService.ts";
import { DEBOUNCE_MS } from "../../../constants.ts";

type PropsType = {
  opened: boolean;
  onClose: () => void;
  office?: Office | null;
};

const INITIAL_DAYS: DayEntryType[] = CAP_DAYS.map((day) => ({
  key: day.toLowerCase(),
  checked: CAP_WORK_DAYS.includes(day),
  intervals: [{ ...DEFAULT_INTERVAL }],
}));

export function ManageOfficeModal({ opened, onClose, office }: PropsType) {
  const t = useT();
  const { isClient } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addressValue, setAddressValue] = useState("");
  const [mapPosition, setMapPosition] = useState<{
    lon: number;
    lat: number;
  } | null>(null);
  const { data: users = [] } = useGetUsersQuery([
    UserRole.NURSE,
    UserRole.DOCTOR,
  ]);

  const { mutate: createOffice, isPending: isCreating } =
    useCreateOfficeMutation();
  const { mutate: updateOffice, isPending: isUpdating } =
    useUpdateOfficeMutation();

  const isEdit = !!office;

  const form = useManageOfficeForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      specialization: "",
      address: "",
      days: INITIAL_DAYS,
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

  form.watch("address", ({ value }) => setAddressValue(value));
  const [debouncedAddress] = useDebouncedValue(addressValue, DEBOUNCE_MS);
  const { data: suggestions = [] } = useAddressSuggestQuery(debouncedAddress);

  const handleAddressSelect = (value: string) => {
    const match = suggestions.find((s) => `${s.name}, ${s.location}` === value);
    setMapPosition(match?.position ?? null);
  };

  // Populate form when office data arrives or modal opens for editing
  useEffect(() => {
    if (office && opened) {
      const hours = office.officeHoursTemplate as Record<
        string,
        Array<{ from: number; to: number }>
      > | null;

      const mappedDays = DAYS.map((day) => {
        const key = day;
        const dayIntervals = hours?.[key] ?? [];

        if (dayIntervals.length === 0) {
          return { key, checked: false, intervals: [{ from: null, to: null }] };
        }

        return {
          key,
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
    } else if (!opened) {
      form.reset();
      setSelectedUserId(null);
      setSelectedRole(null);
    }
  }, [office, opened]);

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

  const userSelectData = useMemo(
    () => {
      const { staffIds } = form.getValues();
      return users
        .filter(
          (u) =>
            !staffIds.includes(u.id) &&
            (!selectedRole || u.role === selectedRole)
        )
        .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));
    },
    // `form` is omitted intentionally — `form.getValues()` reads current state
    // imperatively (uncontrolled mode), so the memo only needs to recompute
    // when the source data or filter changes, not on every form re-render.
    [users, selectedRole]
  );

  const handleSubmit = ({ days, ...rest }: ManageOfficeFormValues) => {
    // Values are already numbers — just filter unchecked/empty and build the DTO
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

    if (isEdit && office) {
      updateOffice(
        { path: { id: office.id }, body: dto },
        { onSuccess: onClose }
      );
    } else {
      createOffice(dto, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEdit
          ? t("office.createOfficeModal.title.detail")
          : t("office.createOfficeModal.title.create")
      }
      size="lg"
    >
      <ManageOfficeFormProvider form={form}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Fieldset disabled={isClient} variant="unstyled">
            <Stack gap="md" m="md">
              {/* Basic Info */}
              <Box>
                <TextInput
                  key={form.key("name")}
                  label={t("office.createOfficeModal.fields.name")}
                  placeholder={t(
                    "office.createOfficeModal.fields.namePlaceholder"
                  )}
                  {...form.getInputProps("name")}
                  mb="xs"
                />
                <TextInput
                  key={form.key("specialization")}
                  label={t("office.createOfficeModal.fields.specialization")}
                  placeholder={t(
                    "office.createOfficeModal.fields.specializationPlaceholder"
                  )}
                  {...form.getInputProps("specialization")}
                  mb="xs"
                />
                <Autocomplete
                  key={form.key("address")}
                  label={t("office.createOfficeModal.fields.address")}
                  placeholder={t(
                    "office.createOfficeModal.fields.addressPlaceholder"
                  )}
                  {...form.getInputProps("address")}
                  data={suggestions.map((s) => `${s.name}, ${s.location}`)}
                  onOptionSubmit={handleAddressSelect}
                />

                {mapPosition ? (
                  <MapPreview
                    lon={mapPosition.lon}
                    lat={mapPosition.lat}
                    style={{ borderRadius: 8, marginTop: 8 }}
                  />
                ) : office?.address ? (
                  <MapPreview
                    address={office.address}
                    style={{ borderRadius: 8, marginTop: 8 }}
                  />
                ) : null}
              </Box>

              {/* Office Hours */}
              <Box py="md">
                <Title order={5} mb="xs">
                  {t("office.createOfficeModal.sections.hours")}
                </Title>

                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>
                        {t("office.createOfficeModal.table.open")}
                      </Table.Th>
                      <Table.Th>
                        {t("office.createOfficeModal.table.day")}
                      </Table.Th>
                      <Table.Th>
                        {t("office.createOfficeModal.table.from")}
                      </Table.Th>
                      <Table.Th>
                        {t("office.createOfficeModal.table.to")}
                      </Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {form.getValues().days.map((day, index) => (
                      <ManageOfficeModalDayRow
                        key={day.key}
                        index={index}
                        label={t(
                          `common.time.daysShort.${day.key}` as ParseKeys
                        )}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>

              {/* Personnel Selection */}
              <Box>
                <Title order={5} mb="xs">
                  {t("office.createOfficeModal.sections.personnel")}
                </Title>

                <Group grow align="flex-end">
                  <Select
                    label={t("office.createOfficeModal.fields.role")}
                    placeholder={t(
                      "office.createOfficeModal.fields.rolePlaceholder"
                    )}
                    data={roleSelectData}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    clearable
                  />

                  <Select
                    label={t("office.createOfficeModal.fields.user")}
                    placeholder={t(
                      "office.createOfficeModal.fields.userPlaceholder"
                    )}
                    data={userSelectData}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    searchable
                    disabled={!selectedRole}
                  />

                  <Button
                    variant="filled"
                    color="gray"
                    disabled={!selectedUserId}
                    onClick={handleAddStaff}
                  >
                    {t("office.createOfficeModal.table.add")}
                  </Button>
                </Group>
              </Box>

              {/* Personnel Table */}
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      {t("office.createOfficeModal.fields.user")}
                    </Table.Th>

                    <Table.Th>
                      {t("office.createOfficeModal.table.role")}
                    </Table.Th>

                    <Table.Th>
                      {t("office.createOfficeModal.table.actions")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {form.getValues().staffIds.map((id, index) => {
                    const member = users.find((u) => u.id === id);

                    if (!member) return null;

                    return (
                      <Table.Tr key={id}>
                        <Table.Td>
                          {member.firstName} {member.lastName}
                        </Table.Td>

                        <Table.Td>{member.role}</Table.Td>

                        <Table.Td>
                          <Button
                            variant="subtle"
                            color="blue"
                            size="xs"
                            onClick={() => handleRemoveStaff(index)}
                          >
                            {t("office.createOfficeModal.table.remove")}
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Fieldset>

          {/* Actions */}
          <Group justify="center" mt="xl">
            <Button variant="outline" color="gray" onClick={onClose}>
              {t("office.createOfficeModal.buttons.cancel")}
            </Button>

            {!isClient && (
              <Button type="submit" loading={isCreating || isUpdating}>
                {isEdit
                  ? t("common.action.save")
                  : t("office.createOfficeModal.buttons.submit")}
              </Button>
            )}
          </Group>
        </form>
      </ManageOfficeFormProvider>
    </Modal>
  );
}
