import { Button } from "@mantine/core";
import { useT } from "@hooks";

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL}/api/auth/google`;

export const GoogleAuthButton = () => {
  const t = useT();

  return (
    <Button
      component="a"
      href={GOOGLE_AUTH_URL}
      variant="default"
      radius="md"
      size="md"
      fullWidth
    >
      {t("login.googleButton")}
    </Button>
  );
};
