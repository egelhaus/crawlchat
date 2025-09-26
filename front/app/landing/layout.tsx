import { Outlet } from "react-router";
import { Container, CTA, Footer, LandingPage, Nav } from "./page";

export default function LandingLayout() {
  return (
    <LandingPage>
      <Container>
        <Nav />
      </Container>

      <Outlet />

      <Container>
        <CTA />
      </Container>

      <Footer />
    </LandingPage>
  );
}
