import React from "react";
import { getPageConfig } from "../PageWrapper";
import { tab_app_name } from "../../../tab_app_info";

export default getPageConfig(
  () => (
    <>
      You can contact Romuald (the creator of {tab_app_name}) at{" "}
      <a className="contact-address"></a>.
    </>
  ),
  "Contact"
);
