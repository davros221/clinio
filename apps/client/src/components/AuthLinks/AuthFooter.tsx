import { Anchor, Center, Group } from "@mantine/core";
import { AuthLinkVariants, useAuthFooter } from "./useAuthFooter.ts";

export type AuthFooterProps = {
  links: AuthLinkVariants[];
};

/**
 * Footer usually placed on the bottom of auth pages, e.g. LoginPage, or SignUp page.
 * Component has a pre-defined set of possible links, it's extendable by passing new links and actions into useAuthFooter
 * hook
 */
export const AuthFooter = (props: AuthFooterProps) => {
  const { links } = useAuthFooter(props);
  return (
    <Center mt="md">
      <Group gap="xs">
        {links.map((link) => (
          <Anchor
            key={link.title}
            component={"button"}
            size={"sm"}
            c={"dimmed"}
            onClick={link.onClick}
          >
            {link.title}
          </Anchor>
        ))}
      </Group>
    </Center>
  );
};
