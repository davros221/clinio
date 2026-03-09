import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <AppShell>
      <AppShell.Main className="root-main">
        <Container size="xl">
          {/* Child routes render here */}
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
