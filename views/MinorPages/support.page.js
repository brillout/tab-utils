import React from "react";
import { getPageConfig } from "../PageWrapper";
import { tab_app_name } from "../../../tab_app_info";

export default getPageConfig(
  () => (
    <>
      Your {tab_app_name} doesn't work? Check out{" "}
      <a href="/bug-repair">Bug Repair</a>.
      <p>
        You have a suggestion? Check out{" "}
        <a href="/feature-suggestion">Feature Suggestion</a>.
      </p>
      <p>
        For other matters, write an email to <a className="contact-address"></a>
        .
      </p>
    </>
  ),
  "Support"
);
