import { Alert, Box, Group, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useNavigate, useParams } from "react-router";
import { useDeleteOfficeMutation, useGetOfficeDetailQuery } from "@api";
import { useT } from "@hooks";
import { BackButton } from "@components";
import { ROUTER_PATHS } from "../../router/routes.ts";
import { ManageOfficeFormProvider } from "../../components/office/ManageOfficeModal/ManageOfficeFormContext";
import { OfficeHoursTemplateDto } from "@clinio/api";
import { useOfficeDetailForm } from "./useOfficeDetailForm.ts";
import { OfficeDetailHeader } from "./components/OfficeDetailHeader.tsx";
import { OfficeDetailAddress } from "./components/OfficeDetailAddress.tsx";
import { OfficeDetailHours } from "./components/OfficeDetailHours.tsx";
import { OfficeDetailPersonnel } from "./components/OfficeDetailPersonnel.tsx";

export function OfficeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const navigate = useNavigate();
  const isNew = !id;
  const [editing, { open: startEdit, close: stopEdit }] = useDisclosure(isNew);

  const { mutate: deleteOffice } = useDeleteOfficeMutation();

  const {
    data: office,
    isLoading,
    isError,
    error,
  } = useGetOfficeDetailQuery(id ?? "", !isNew);

  const {
    form,
    users,
    isPending,
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
  } = useOfficeDetailForm(office, editing, isNew, stopEdit);

  const handleDelete = () => {
    modals.openConfirmModal({
      title: t("office.deleteModal.title"),
      centered: true,
      children: <Text size="sm">{t("office.deleteModal.message")}</Text>,
      labels: {
        confirm: t("office.deleteModal.confirm"),
        cancel: t("office.deleteModal.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteOffice(
          { path: { id: id! } },
          { onSuccess: () => navigate(ROUTER_PATHS.OFFICES) }
        ),
    });
  };

  if (!isNew && isLoading) {
    return <Loader />;
  }

  if (!isNew && (isError || !office)) {
    return (
      <Alert color="red" title={t("common.error.general")}>
        {error instanceof Error ? error.message : String(error ?? "")}
      </Alert>
    );
  }

  return (
    <Box>
      <Group mb="lg">
        <BackButton to={ROUTER_PATHS.OFFICES} />
      </Group>

      <ManageOfficeFormProvider form={form}>
        <Stack gap="md">
          <OfficeDetailHeader
            office={office ?? null}
            editing={editing}
            isNew={isNew}
            isPending={isPending}
            onEdit={startEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />

          <OfficeDetailAddress
            office={office ?? null}
            editing={editing}
            suggestions={suggestions}
            mapPosition={mapPosition}
            onAddressSelect={handleAddressSelect}
          />

          <Group align="stretch" wrap="wrap" gap="md">
            <OfficeDetailHours
              template={
                office
                  ? (office.officeHoursTemplate as OfficeHoursTemplateDto)
                  : null
              }
              editing={editing}
            />

            <OfficeDetailPersonnel
              editing={editing}
              users={users}
              staffIds={editing ? watchedStaffIds : office?.staffIds ?? []}
              selectedRole={selectedRole}
              selectedUserId={selectedUserId}
              roleSelectData={roleSelectData}
              userSelectData={userSelectData}
              onRoleChange={handleRoleChange}
              onUserChange={setSelectedUserId}
              onAddStaff={handleAddStaff}
              onRemoveStaff={handleRemoveStaff}
            />
          </Group>
        </Stack>
      </ManageOfficeFormProvider>
    </Box>
  );
}
