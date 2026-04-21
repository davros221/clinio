import { Button } from "@mantine/core";
import { useT } from "@hooks";

export const GoogleAuthButton = () => {
  const t = useT();
  const returnTo = encodeURIComponent(window.location.origin);
  const href = `${
    import.meta.env.VITE_API_URL
  }/api/auth/google?returnTo=${returnTo}`;

  return (
    <Button
      component="a"
      href={href}
      fullWidth
      variant={"outline"}
      radius={"xl"}
      size={"md"}
    >
      {t("login.googleButton")}
    </Button>
  );
};
