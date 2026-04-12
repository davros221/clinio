import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useT } from "@hooks";
import { AuthFooterProps } from "@components";

export type AuthLinkVariants = "login" | "signUp" | "forgotPassword";

type AuthLink = {
  title: string;
  onClick: () => void;
};

type AuthLinkDefinition = Record<AuthLinkVariants, AuthLink>;

export const useAuthFooter = (props: AuthFooterProps) => {
  const navigate = useNavigate();
  const t = useT();

  const linkDefinition: AuthLinkDefinition = {
    login: {
      title: t("login.login"),
      onClick: () => navigate(ROUTER_PATHS.LOGIN),
    },
    signUp: {
      title: t("login.signUp"),
      onClick: () => navigate(ROUTER_PATHS.SIGN_UP),
    },
    forgotPassword: {
      title: t("login.forgotPassword"),
      onClick: () => navigate(ROUTER_PATHS.RESET_PASSWORD),
    },
  };

  const links: AuthLink[] = props.links.map(
    (variant) => linkDefinition[variant]
  );

  return { links };
};
