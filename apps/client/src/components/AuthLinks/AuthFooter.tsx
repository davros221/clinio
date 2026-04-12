import { Anchor, Center, Group } from "@mantine/core";
import { AuthLinkVariants, useAuthFooter } from "./useAuthFooter.ts";

export type AuthFooterProps = {
  links: AuthLinkVariants[];
};

/**
 * Component rendering footer with links on various Auth Pages
 * @param props
 * @constructor
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
