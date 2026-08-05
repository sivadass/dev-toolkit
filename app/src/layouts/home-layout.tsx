import { Container } from "cleanplate";
import { Outlet } from "react-router-dom";
import { SiteHeader } from "../components/site-header";

export function HomeLayout() {
  return (
    <div className="home-shell">
      <SiteHeader />
      <main id="main" className="home-shell__main">
        <Container padding={["6", "y-8"]} width="full">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
