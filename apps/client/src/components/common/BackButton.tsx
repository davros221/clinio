import { Button } from "@mantine/core";
import { type To, useNavigate } from "react-router";
import { MdChevronLeft } from "react-icons/md";
import { useT } from "@hooks";

type Props = {
  to?: To;
  label?: string;
};

export function BackButton({ to, label }: Props) {
  const navigate = useNavigate();
  const t = useT();

  return (
    <Button
      variant="outline"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      leftSection={<MdChevronLeft />}
    >
      {label ?? t("common.action.back")}
    </Button>
  );
}
