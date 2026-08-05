import { Container, Header } from "cleanplate";
import { Link, Outlet } from "react-router-dom";

function BrandLink() {
  return (
    <Link to="/" className="brand-wordmark">
      Dev<span className="brand-wordmark__accent">Toolkit</span>
    </Link>
  );
}

export function HomeLayout() {
  return (
    <>
      <Header
        menuItems={[]}
        showCenterMenu={false}
        headerLeft={<BrandLink />}
        size="medium"
        variant="light"
      />
      <Container padding="6" width="extra-large">
        <Outlet />
      </Container>
    </>
  );
}
