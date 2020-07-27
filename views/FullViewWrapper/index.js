import assert from "@brillout/assert";
import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import "./full-view.css";
import on_page_load from "./on_page_load";
import { tab_app_logo } from "../../../tab_app_info";

export { FullView, MorePanel, LeftSide, RightSide, FullViewLayout, config };

function FullViewLayout(props) {
  assert(!props.id);
  return <div id="fv_full-view-layout" {...props} />;
}

function FullView(props) {
  const { children } = props;
  return (
    <>
      <Header />

      <div
        className="pretty_scroll_area__hide_scroll_element load-area"
        {...props}
      >
        {children}
        <div id="screen-buttons-wrapper">
          <ScreenButton id="donate-button" />
          <ScreenButton id="center-button" />
          <ScreenButton id="fullscreen-button" />
          <ScreenButton id="zoom-button" />
          <ScreenButton id="settings-button" />
          <ScreenButton id="thanks-button" />
          <ScreenButton id="width-setter-button" />
        </div>
      </div>
    </>
  );
}

function ScreenButton({ id }) {
  return (
    <div id={id} click-name={id} className="screen-button">
      <div className="button-background glass-background" />
      <span className="button-icon"></span>
      <span className="button-text"></span>
    </div>
  );
}

function LeftSide({ children, ...props }) {
  assert(!props.id);
  return (
    <div
      id="fv_left-side"
      {...props}
      click-name="fv_left-side"
      style={{
        position: "relative",
      }}
    >
      <div id="fv_left-side_background" className="glass-background" />
      {children}
    </div>
  );
}

function RightSide(props) {
  assert(!props.id);
  return <div id="fv_right-side" {...props} />;
}

function MorePanel(props) {
  const { children } = props;
  return (
    <div id="more_panel">
      <div id="more_panel_background" className="glass-background"></div>
      {children}
      <Footer />
    </div>
  );
}

function config({ onPageLoad, ...conf }) {
  return {
    renderToDom: true,
    renderToHtml: true,
    favicon: tab_app_logo,
    ...conf,
    on_page_load: (goldpage_args) => on_page_load(onPageLoad, goldpage_args),
  };
}
