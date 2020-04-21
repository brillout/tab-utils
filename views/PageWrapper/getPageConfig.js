import React from "react";
import PageWrapper from "./PageWrapper";
import on_page_load from "./on_page_load";
import { tab_app_name, tab_app_logo } from "../../../tab_app_info";

export { getPageConfig };

function getPageConfig(
  View,
  header,
  { route, onPageLoad, noHeader, ...pageConfig } = {}
) {
  route = route || "/" + header.toLowerCase().split(" ").join("-");
  const title = header + " - " + tab_app_name;

  const view = () => (
    <PageWrapper>
      {!noHeader && <h1>{header}</h1>}
      <View />
    </PageWrapper>
  );

  return {
    view,
    route,
    title,
    on_page_load: () => on_page_load(onPageLoad),
    favicon: tab_app_logo,
    renderToDom: true,
    renderToHtml: true,
    ...pageConfig,
  };
}
