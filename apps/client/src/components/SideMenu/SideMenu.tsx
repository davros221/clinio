import { Stack, Avatar, Text, Group, Divider } from "@mantine/core";
import { SideMenuItem } from "./SideMenuItem.tsx";
import { useSideMenu } from "./useSideMenu.ts";
import { useUserRole } from "@hooks";

export const SideMenu = () => {
  const { navItems, initials, user } = useSideMenu();
  const { isOnboardingClient } = useUserRole();

  return (
    <Stack gap="xs" h="100%">
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

      <Stack
        h={"100%"}
        gap={"xxs"}
        justify={isOnboardingClient ? "end" : "start"}
      >
        {navItems.map((item, i) => (
          <SideMenuItem key={i} {...item} />
        ))}
      </Stack>
    </Stack>
  );
};
