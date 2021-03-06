import React from "react";
import "./footer.css";
import { tab_app_name, tab_app_source_code } from "../../../tab_app_info";

export default Footer;

function Footer() {
  return (
    <Container>
      <Section>
        <Header>Support</Header>

        <Link href="/repair">Bug Repair</Link>
        <Link href="/suggest">Suggest a Feature</Link>
        <Link href="/support">Get help & support</Link>
      </Section>

      <Section>
        <Header>Get Involved</Header>

        <Link href="/donate">Donate</Link>
        <Link href="/contribute">Contribute</Link>
      </Section>

      <Section>
        <Header>{tab_app_name}</Header>

        <Link href="/roadmap">Roadmap</Link>
        <Link href={tab_app_source_code} target="_blank">
          Source Code
        </Link>
        <Link href="/contact">Contact</Link>
        <Link href="/about">About</Link>
      </Section>

      <Section>
        <Header>Legal & conduct</Header>

        <Link href="/conduct">Code of Conduct</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy-policy">Privacy Policy</Link>
      </Section>
    </Container>
  );
}
/*
        <Link href="/new-features">New Features</Link>
        <Link href="/donate">Remove Ads</Link>
        <Link href="/discussion">Discussions & questions</Link>
        <Link href="/timer-tab">Timer Tab</Link>
        <Link href="/author">Author</Link>
*/

function Container({ children }) {
  return <div id="footer_container">{children}</div>;
}

function Section({ children }) {
  return <div className="footer_section">{children}</div>;
}

function Header({ children }) {
  return (
    <h4
      className="footer-section-title"
      style={{
        marginBottom: 7,
        fontWeight: "normal",
      }}
    >
      {children}
    </h4>
  );
}

function Link(props) {
  return (
    <a
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
      click-name={"footer-link-" + props.href}
      {...props}
    />
  );
}
