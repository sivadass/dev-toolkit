import { Button, Header } from "cleanplate";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getToolMenuItems } from "../config/tools";

function BrandLink() {
  return (
    <Link to="/" className="brand-wordmark">
      Dev<span className="brand-wordmark__accent">Toolkit</span>
    </Link>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const menuItems = getToolMenuItems().map((item) => ({
    ...item,
    icon: item.icon as never,
  }));

  return (
    <Header
      className="site-header"
      menuItems={menuItems}
      showCenterMenu={false}
      activeMenuItem={isHome ? undefined : location.pathname}
      onMenuItemClick={(item) => navigate(String(item.value))}
      headerLeft={<BrandLink />}
      headerRight={
        isHome ? (
          <span className="site-header__actions-slot" aria-hidden="true" />
        ) : (
          <Button variant="ghost" size="small" onClick={() => navigate("/")}>
            All tools
          </Button>
        )
      }
      size="medium"
      variant="light"
    />
  );
}
