import React from "react";
import "./header.css";
import {
  tab_app_name,
  tab_app_logo,
  tab_app_header_links,
} from "../../../tab_app_info";

export default Header;

function Header() {
  return (
    <div id="header-container" className="glass-background" click-name="header">
      <div id="header-content">
        <Logo />
        {tab_app_header_links.map(
          ({ link_name, link_url, link_target }, idx) => (
            <Link href={link_url} target={link_target} key={idx}>
              {link_name}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <a id="header-logo" href="/" click-name="header-logo">
      <img src={tab_app_logo} />
      <h1>{tab_app_name}</h1>
    </a>
  );
}

function Link(props) {
  return (
    <a
      className="header-link"
      click-name={"header-link-" + props.href}
      {...props}
    ></a>
  );
}
