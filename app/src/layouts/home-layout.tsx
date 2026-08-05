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
    <div className="home-shell">
      <Header
        menuItems={[]}
        showCenterMenu={false}
        headerLeft={<BrandLink />}
        size="medium"
        variant="light"
      />
      <main id="main" className="home-shell__main">
        <Container padding={["6", "y-8"]} width="full">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
