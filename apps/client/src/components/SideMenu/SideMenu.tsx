import { Stack, Avatar, Text, Group, Divider } from "@mantine/core";
import { SideMenuItem } from "./SideMenuItem.tsx";
import { useSideMenu } from "./useSideMenu.ts";

interface SideMenuProps {
  showUserInfo?: boolean;
}

export const SideMenu = ({ showUserInfo = true }: SideMenuProps) => {
  const { navItems, bottomItems, initials, user } = useSideMenu(showUserInfo);

  return (
    <Stack gap="xs" h="100%">
      {showUserInfo && (
        <>
          <Group gap="xxs">
            <Avatar radius="xl" size="lg" color="white">
              {initials}
            </Avatar>

            <div>
              <Text size="sm" c="white" fw={600} lineClamp={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text size="xs" c="white">
                {user?.role}
              </Text>
            </div>
          </Group>

          <Divider />
        </>
      )}

      <Stack h={"100%"} gap={"xxs"}>
        {navItems.map((item, i) => (
          <SideMenuItem key={i} {...item} />
        ))}

        <Stack gap="xxs" mt="auto">
          {bottomItems.map((item, i) => (
            <SideMenuItem key={i} {...item} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
