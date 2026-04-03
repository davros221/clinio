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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetUsersQuery } from "../../../api/userService.ts";
import { UserRole } from "@clinio/shared";
import { DAYS, WEEK_DAYS } from "../../utils/types.ts";
import {
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
} from "../../../api/officeService.ts";
import { CreateOfficeDto, Office } from "@clinio/api";
import {
  ManageOfficeModalDayRow,
  SELECTABLE_HOURS,
} from "./ManageOfficeModalDayRow.tsx";
import { useT } from "../../../hooks/useT";
import { ParseKeys } from "i18next";

type HourEntryType = (typeof SELECTABLE_HOURS)[number] | null;

type IntervalType = { from: HourEntryType; to: HourEntryType };

/** Max 2 intervals per day (e.g. morning + afternoon split) */
const MAX_INTERVALS_PER_DAY = 2;

type DayEntryType = {
  key: string;
  checked: boolean;
  intervals: IntervalType[];
};

type FormValues = {
  name: string;
  specialization: string;
  address: string;
  days: DayEntryType[];
  staffIds: string[];
};

type PropsType = {
  opened: boolean;
  onClose: () => void;
  office?: Office | null; // If provided, we are in Edit mode
};

const DEFAULT_INTERVAL: IntervalType = {
  from: "08:00" as HourEntryType,
  to: "16:00" as HourEntryType,
};

const INITIAL_DAYS: DayEntryType[] = WEEK_DAYS.map((day) => ({
  key: day.toLowerCase(),
  checked: DAYS.includes(day),
  intervals: [{ ...DEFAULT_INTERVAL }],
}));

export function ManageOfficeModal({ opened, onClose, office }: PropsType) {
  const t = useT();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: users = [] } = useGetUsersQuery([
    UserRole.NURSE,
    UserRole.DOCTOR,
  ]);

  const { mutate: createOffice, isPending: isCreating } =
    useCreateOfficeMutation();
  const { mutate: updateOffice, isPending: isUpdating } =
    useUpdateOfficeMutation();

  const isEdit = !!office;

  const form = useForm<FormValues>({
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
          from: (value: HourEntryType, values: FormValues, path: string) => {
            const dayIndex = Number(path.split(".")[1]);
            return values.days[dayIndex].checked && !value
              ? t("common.validation.required")
              : null;
          },
          to: (value: HourEntryType, values: FormValues, path: string) => {
            const dayIndex = Number(path.split(".")[1]);
            return values.days[dayIndex].checked && !value
              ? t("common.validation.required")
              : null;
          },
        },
      },
    },
  });

  // Populate form when office data arrives or modal opens for editing
  // form is intentionally omitted from deps — it's a stable ref from useForm
  useEffect(() => {
    if (office && opened) {
      const hours = office.officeHoursTemplate as Record<
        string,
        Array<{ from: number; to: number }>
      > | null;

      const mappedDays = WEEK_DAYS.map((day) => {
        const key = day.toLowerCase();
        const dayIntervals = hours?.[key] ?? [];

        if (dayIntervals.length === 0) {
          return {
            key,
            checked: false,
            intervals: [
              { from: null as HourEntryType, to: null as HourEntryType },
            ],
          };
        }

        return {
          key,
          checked: true,
          intervals: dayIntervals.map((slot) => ({
            from: `${slot.from
              .toString()
              .padStart(2, "0")}:00` as HourEntryType,
            to: `${slot.to.toString().padStart(2, "0")}:00` as HourEntryType,
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

  const { setFieldValue, insertListItem, removeListItem } = form;

  const handleDayChecked = useCallback(
    (index: number, checked: boolean) => {
      setFieldValue(`days.${index}.checked`, checked);
      setFieldValue(
        `days.${index}.intervals`,
        checked
          ? [{ ...DEFAULT_INTERVAL }]
          : [{ from: null as HourEntryType, to: null as HourEntryType }]
      );
    },
    [setFieldValue]
  );

  const handleFromChange = useCallback(
    (dayIndex: number, intervalIndex: number, val: string | null) => {
      setFieldValue(
        `days.${dayIndex}.intervals.${intervalIndex}.from`,
        val as HourEntryType
      );
    },
    [setFieldValue]
  );

  const handleToChange = useCallback(
    (dayIndex: number, intervalIndex: number, val: string | null) => {
      setFieldValue(
        `days.${dayIndex}.intervals.${intervalIndex}.to`,
        val as HourEntryType
      );
    },
    [setFieldValue]
  );

  const handleAddInterval = useCallback(
    (dayIndex: number) => {
      const current = form.getValues().days[dayIndex].intervals;
      if (current.length >= MAX_INTERVALS_PER_DAY) return;
      insertListItem(`days.${dayIndex}.intervals`, {
        from: null as HourEntryType,
        to: null as HourEntryType,
      });
    },
    [form, insertListItem]
  );

  const handleRemoveInterval = useCallback(
    (dayIndex: number, intervalIndex: number) => {
      removeListItem(`days.${dayIndex}.intervals`, intervalIndex);
    },
    [removeListItem]
  );

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

  const handleSubmit = ({ days, ...rest }: FormValues) => {
    const parseHourToInt = (hour: HourEntryType) =>
      hour ? parseInt(hour.split(":")[0]) : 0;

    const officeHoursTemplate = Object.fromEntries(
      days.map(({ key, checked, intervals }) => [
        key,
        checked
          ? intervals
              .filter(({ from, to }) => from && to)
              .map(({ from, to }) => ({
                from: parseHourToInt(from),
                to: parseHourToInt(to),
              }))
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" m="md">
          {/* Basic Info */}
          <Box>
            <TextInput
              key={form.key("name")}
              label={t("office.createOfficeModal.fields.name")}
              placeholder={t("office.createOfficeModal.fields.namePlaceholder")}
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
            <TextInput
              key={form.key("address")}
              label={t("office.createOfficeModal.fields.address")}
              placeholder={t(
                "office.createOfficeModal.fields.addressPlaceholder"
              )}
              {...form.getInputProps("address")}
            />
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
                  <Table.Th>{t("office.createOfficeModal.table.day")}</Table.Th>
                  <Table.Th>
                    {t("office.createOfficeModal.table.from")}
                  </Table.Th>
                  <Table.Th>{t("office.createOfficeModal.table.to")}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {form.values.days.map((day, index) => (
                  <ManageOfficeModalDayRow
                    key={day.key}
                    index={index}
                    label={t(`common.time.daysShort.${day.key}` as ParseKeys)}
                    checked={day.checked}
                    intervals={day.intervals}
                    onCheck={handleDayChecked}
                    onFromChange={handleFromChange}
                    onToChange={handleToChange}
                    onAddInterval={handleAddInterval}
                    onRemoveInterval={handleRemoveInterval}
                    errors={day.intervals.map((_, i) => ({
                      from: form.errors[`days.${index}.intervals.${i}.from`],
                      to: form.errors[`days.${index}.intervals.${i}.to`],
                    }))}
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
                <Table.Th>{t("office.createOfficeModal.fields.user")}</Table.Th>

                <Table.Th>{t("office.createOfficeModal.table.role")}</Table.Th>

                <Table.Th>
                  {t("office.createOfficeModal.table.actions")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {form.values.staffIds.map((id, index) => {
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

          {/* Actions */}
          <Group justify="center" mt="xl">
            <Button variant="outline" color="gray" onClick={onClose}>
              {t("office.createOfficeModal.buttons.cancel")}
            </Button>

            <Button type="submit" loading={isCreating || isUpdating}>
              {isEdit
                ? t("common.action.save")
                : t("office.createOfficeModal.buttons.submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
