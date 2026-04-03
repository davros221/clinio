import { Button } from "@mantine/core";
import { ManageOfficeModal } from "./ManageOfficeModal.tsx";
import { useDisclosure } from "@mantine/hooks";
import { useGetOfficeDetailQuery } from "../../../api/officeService.ts";
import { useT } from "../../../hooks/useT";
import { notifyError } from "../../../utils/notification";

type PropsType = {
  officeId?: string;
};

export function ManageOfficeModalOpenBtn({ officeId }: PropsType) {
  const t = useT();
  const [opened, { open, close }] = useDisclosure(false);

  // Disable automatic fetching — fetch manually on button click
  const {
    data: office,
    isFetching,
    refetch,
  } = useGetOfficeDetailQuery(officeId ?? "", false);

  const handleOpen = async () => {
    if (officeId) {
      const result = await refetch();
      if (result.isError) {
        notifyError(t("common.error.noData"), String(result.error));
        return;
      }
    }
    open();
  };

  const openBtnText = t(
    officeId
      ? "office.createOfficeModal.title.detail"
      : "office.createOfficeModal.title.create"
  );

  return (
    <>
      <Button onClick={handleOpen} loading={isFetching} size="xs">
        {openBtnText}
      </Button>

      {opened && (
        <ManageOfficeModal opened={opened} onClose={close} office={office} />
      )}
    </>
  );
}
