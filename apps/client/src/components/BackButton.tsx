import { Button } from "@mantine/core";
import { type To, useNavigate } from "react-router";
import { useT } from "@hooks";

type Props = {
  to?: To;
};

export function BackButton({ to }: Props) {
  const navigate = useNavigate();
  const t = useT();

  return (
    <Button
      variant="subtle"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      leftSection={<span>&lsaquo;</span>}
    >
      {t("common.action.back")}
    </Button>
  );
}
