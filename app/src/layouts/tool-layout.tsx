import { AppShell, Button } from "cleanplate";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getToolMenuItems } from "../config/tools";

function BrandLink() {
  return (
    <Link to="/" className="brand-wordmark">
      Dev<span className="brand-wordmark__accent">Toolkit</span>
    </Link>
  );
}

export function ToolLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = getToolMenuItems().map((item) => ({
    ...item,
    icon: item.icon as never,
  }));

  return (
    <AppShell
      header={{
        menuItems,
        showCenterMenu: false,
        activeMenuItem: location.pathname,
        onMenuItemClick: (item) => navigate(String(item.value)),
        headerLeft: <BrandLink />,
        headerRight: (
          <Button variant="ghost" size="small" onClick={() => navigate("/")}>
            All tools
          </Button>
        ),
        size: "medium",
        variant: "light",
      }}
      sidebar={{
        items: menuItems,
        activeItem: location.pathname,
        onMenuClick: (item) => navigate(String(item.value)),
        variant: "light",
        size: "medium",
      }}
      sidebarWidth="240px"
    >
      <Outlet />
    </AppShell>
  );
}
