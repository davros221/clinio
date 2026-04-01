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
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGetUsersQuery } from "../../../api/userService.ts";
import { UserRole } from "@clinio/shared";
import { DAYS, WEEK_DAYS } from "../../utils/types.ts";
import {
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
} from "../../../api/officeService.ts";
import { Office } from "@clinio/api";
import {
  ManageOfficeModalDayRow,
  SELECTABLE_HOURS,
} from "./ManageOfficeModalDayRow.tsx";
import { useT } from "../../../hooks/useT";
import { ParseKeys } from "i18next";

type HourEntryType = (typeof SELECTABLE_HOURS)[number] | null;

type DayEntryType = {
  key: string;
  from: HourEntryType;
  to: HourEntryType;
  checked: boolean;
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
  office?: Office; // If provided, we are in Edit mode
};

const INITIAL_DAYS: DayEntryType[] = WEEK_DAYS.map((day) => ({
  key: day.toLowerCase(),
  from: "08:00" as HourEntryType,
  to: "16:00" as HourEntryType,
  checked: DAYS.includes(day),
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

  const formValidate = useMemo(
    () => ({
      name: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      specialization: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      address: (value: string) =>
        value.trim() ? null : t("common.validation.required"),
      days: {
        from: (value: HourEntryType, values: FormValues, path: string) => {
          const index = Number(path.split(".")[1]);
          return values.days[index].checked && !value
            ? t("common.validation.required")
            : null;
        },
        to: (value: HourEntryType, values: FormValues, path: string) => {
          const index = Number(path.split(".")[1]);
          return values.days[index].checked && !value
            ? t("common.validation.required")
            : null;
        },
      },
    }),
    [t]
  );

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      specialization: "",
      address: "",
      days: INITIAL_DAYS,
      staffIds: [],
    },
    validate: formValidate,
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
        const dayData = hours?.[key]?.[0];

        return {
          key,
          from: dayData
            ? (`${dayData.from
                .toString()
                .padStart(2, "0")}:00` as HourEntryType)
            : null,
          to: dayData
            ? (`${dayData.to.toString().padStart(2, "0")}:00` as HourEntryType)
            : null,
          checked: !!dayData,
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

  const { setFieldValue } = form;

  const handleDayChecked = useCallback(
    (index: number, checked: boolean) => {
      startTransition(() => {
        setFieldValue(`days.${index}.checked`, checked);
        if (!checked) {
          setFieldValue(`days.${index}.from`, null);
          setFieldValue(`days.${index}.to`, null);
        } else {
          setFieldValue(`days.${index}.from`, "08:00" as HourEntryType);
          setFieldValue(`days.${index}.to`, "16:00" as HourEntryType);
        }
      });
    },
    [setFieldValue]
  );

  const handleFromChange = useCallback(
    (index: number, val: string | null) => {
      startTransition(() =>
        setFieldValue(`days.${index}.from`, val as HourEntryType)
      );
    },
    [setFieldValue]
  );

  const handleToChange = useCallback(
    (index: number, val: string | null) => {
      startTransition(() =>
        setFieldValue(`days.${index}.to`, val as HourEntryType)
      );
    },
    [setFieldValue]
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
    () =>
      users
        .filter(
          (u) =>
            !form.values.staffIds.includes(u.id) &&
            (!selectedRole || u.role === selectedRole)
        )
        .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })),
    [users, form.values.staffIds, selectedRole]
  );

  const handleSubmit = ({ days, ...rest }: FormValues) => {
    const parseHourToInt = (hour: HourEntryType) =>
      hour ? parseInt(hour.split(":")[0]) : 0;

    const officeHoursTemplate = Object.fromEntries(
      days.map(({ key, from, to, checked }) => [
        key,
        checked && from && to
          ? [{ from: parseHourToInt(from), to: parseHourToInt(to) }]
          : [],
      ])
    );

    const dto = {
      ...rest,
      officeHoursTemplate,
    };

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
              label={t("office.createOfficeModal.fields.name")}
              placeholder={t("office.createOfficeModal.fields.namePlaceholder")}
              {...form.getInputProps("name")}
              mb="xs"
            />
            <TextInput
              label={t("office.createOfficeModal.fields.specialization")}
              placeholder={t(
                "office.createOfficeModal.fields.specializationPlaceholder"
              )}
              {...form.getInputProps("specialization")}
              mb="xs"
            />
            <TextInput
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
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {form.values.days.map((day, index) => (
                  <ManageOfficeModalDayRow
                    key={day.key}
                    index={index}
                    label={t(`common.time.daysShort.${day.key}` as ParseKeys)}
                    checked={day.checked}
                    fromValue={day.from}
                    toValue={day.to}
                    onCheck={handleDayChecked}
                    onFromChange={handleFromChange}
                    onToChange={handleToChange}
                    errorFrom={form.errors[`days.${index}.from`]}
                    errorTo={form.errors[`days.${index}.to`]}
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
