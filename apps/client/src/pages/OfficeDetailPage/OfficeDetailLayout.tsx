import { Alert, Box, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Outlet, useNavigate, useParams } from "react-router";
import { useDeleteOfficeMutation, useGetOfficeDetailQuery } from "@api";
import { useT } from "@hooks";
import { ROUTER_PATHS } from "@router";
import { ManageOfficeFormProvider } from "../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { useOfficeDetailForm } from "./useOfficeDetailForm.ts";
import { OfficeDetailHeader } from "./components/OfficeDetailHeader.tsx";
import type { OfficeDetailOutletContext } from "./useOfficeDetailContext.ts";

export function OfficeDetailLayout() {
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

  const formData = useOfficeDetailForm(office, editing, isNew, stopEdit);
  const { form, isPending, handleSave, handleCancel } = formData;

  const handleDelete = () => {
    if (!id) return;
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
          { path: { id } },
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

  const contextValue: OfficeDetailOutletContext = {
    ...formData,
    office: office ?? null,
    editing,
    isNew,
  };

  return (
    <ManageOfficeFormProvider form={form}>
      <Box>
        <Box
          pos="sticky"
          top={0}
          bg="var(--mantine-color-body)"
          style={{ zIndex: 10 }}
          pb="md"
        >
          <OfficeDetailHeader
            office={office ?? null}
            editing={editing}
            isNew={isNew}
            isPending={isPending}
            backTo={ROUTER_PATHS.OFFICES}
            onEdit={startEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        </Box>

        <Stack gap="md">
          <Outlet context={contextValue} />
        </Stack>
      </Box>
    </ManageOfficeFormProvider>
  );
}
