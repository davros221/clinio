import { Button } from "@mantine/core";
import { type To, useNavigate } from "react-router";
import { MdChevronLeft } from "react-icons/md";
import { useT } from "@hooks";

type Props = {
  to?: To;
};

export function BackButton({ to }: Props) {
  const navigate = useNavigate();
  const t = useT();

  return (
    <Button
      variant="outline"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      leftSection={<MdChevronLeft />}
    >
      {t("common.action.back")}
    </Button>
  );
}
