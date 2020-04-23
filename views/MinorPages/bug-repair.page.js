import React from "react";
import { getPageConfig } from "../PageWrapper";
import { tab_app_name } from "../../../tab_app_info";
import { get_browser_info } from "../../utils/get_browser_info";
import { get_tab_user_id } from "../../utils/TabUserId";

export default getPageConfig(
  () => (
    <>
      <p>
        If {tab_app_name} doesn't work, send this{" "}
        <a
          id="repair-link"
          data-subject="Bug Repair"
          className="contact-address"
          target="_blank"
        >
          pre-filled email
        </a>
        .
      </p>
      <p>
        It gives information for Romuald to fix the bug, which he usually does
        within 24 hours.
      </p>
      <p>
        If the pre-filled email link above doesn't work then write an email to{" "}
        <a className="contact-address" target="_blank"></a> with your user ID:
      </p>
      <p style={{ paddingLeft: 20 }}>
        <b>
          My user ID: <span id="tab-user-id" />
        </b>
      </p>
    </>
  ),
  "Bug Repair",
  { onPageLoad }
);

/*
function CodeBlock(props) {
  return (
    <pre
      style={{ margin: 0, wordWrap: "break-word", whiteSpace: "pre-wrap" }}
      {...props}
    />
  );
}
*/

function onPageLoad() {
  const link = document.querySelector("#repair-link");

  const tab_user_id = get_tab_user_id();

  document.querySelector("#tab-user-id").innerHTML = tab_user_id;

  link.setAttribute(
    "data-body",
    [
      "Hi Romuald, my " + tab_app_name + " does not work.",
      "",
      "My user ID:",
      tab_user_id,
      "",
      "My Browser:",
      get_browser_info(),
      "",
      "Thanks for having a look.",
    ].join("\n")
  );
}
