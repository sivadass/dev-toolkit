import { AppShell, Container } from "cleanplate";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/site-header";
import { getToolMenuItems } from "../config/tools";

export function ToolLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = getToolMenuItems().map((item) => ({
    ...item,
    icon: item.icon as never,
  }));

  return (
    <AppShell
      header={<SiteHeader />}
      sidebar={{
        items: menuItems,
        activeItem: location.pathname,
        onMenuClick: (item) => navigate(String(item.value)),
        variant: "light",
        size: "medium",
      }}
      sidebarWidth="240px"
      mobileSidebarDrawer={false}
    >
      <Container padding="4">
        <Outlet />
      </Container>
    </AppShell>
  );
}
