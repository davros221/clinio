import {
  Stack,
  Avatar,
  Text,
  Group,
  Divider,
  Badge,
  SegmentedControl,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SideMenuItem } from "./SideMenuItem.tsx";
import { useSideMenu } from "./useSideMenu.ts";

interface SideMenuProps {
  showUserInfo?: boolean;
}

export const SideMenu = ({ showUserInfo = true }: SideMenuProps) => {
  const { navItems, bottomItems, initials, user } = useSideMenu(showUserInfo);
  const { i18n } = useTranslation();

  return (
    <Stack gap="xs" h="100%">
      {showUserInfo && (
        <>
          <Group gap="xxs">
            <Avatar radius="xl" size="lg" color="initials" name={initials}>
              {initials}
            </Avatar>

            <div>
              <Text size="sm" c="white" fw={600} lineClamp={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Badge variant="light" color="blue">
                {user?.role}
              </Badge>
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
          <SegmentedControl
            size="xs"
            fullWidth
            color={"blue"}
            value={i18n.language}
            onChange={(lang) => i18n.changeLanguage(lang)}
            data={[
              { label: "EN", value: "en" },
              { label: "CS", value: "cs" },
            ]}
          />
          {bottomItems.map((item, i) => (
            <SideMenuItem key={i} {...item} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
