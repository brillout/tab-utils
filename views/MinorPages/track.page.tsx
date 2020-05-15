import React from "react";
import { getPageConfig } from "../PageWrapper";
import { get_deploy_id } from "../../utils/get_deploy_id";
import { get_tab_user_id } from "../../utils/TabUserId";

export default getPageConfig(
  () => (
    <>
      <p>
        <a id="errors" target="_blank">
          Errors
        </a>
        <br />
        <a id="events" target="_blank">
          Events
        </a>
      </p>
      <h3>User</h3>
      <form>
        User ID: <input placeholder="User ID" type="text" />
        <br />
        <button type="submit">Today</button>
        <button id="user-last-7-days" type="button">
          Last 7 days
        </button>
      </form>
      <h3>Track Data</h3>
      Depoy ID: <b id="deploy-id" />
      <br />
      User ID: <b id="my-id" />
    </>
  ),
  "Track",
  { onPageLoad }
);

function onPageLoad() {
  const deploy_id = get_deploy_id();
  const my_id = get_tab_user_id();

  document.querySelector("#deploy-id").textContent = deploy_id;
  document.querySelector("#my-id").textContent = my_id;

  (document.querySelector("a#errors") as HTMLAnchorElement).href = link_errors(
    deploy_id
  );

  (document.querySelector("a#events") as HTMLAnchorElement).href = link_events(
    deploy_id
  );

  {
    let user_id = "123456789";
    document.querySelector("input").onchange = (ev: any) =>
      (user_id = ev.target.value);

    document.querySelector("form").onsubmit = (ev) => {
      ev.preventDefault();
      window.open(link_user(user_id, 1), "_blank");
    };

    (document.querySelector(
      "button#user-last-7-days"
    ) as HTMLButtonElement).onclick = (ev) => {
      window.open(link_user(user_id, 7), "_blank");
    };
  }
}

function link_events(deploy_id: string) {
  return google_analytics_link("eventCategory", 30, deploy_id);
}

function link_errors(deploy_id: string) {
  return google_analytics_link("eventCategory", 30, deploy_id + "%5D%5Berror");
}

function link_user(user_id: string, days_ago: number) {
  return google_analytics_link("eventLabel", days_ago, user_id);
}

function google_analytics_link(
  segmentId: string,
  days_ago: number,
  filter?: string
) {
  return (
    "https://analytics.google.com/analytics/web/#/report/content-event-events/a5263303w24659375p23108560/" +
    `_u.date00=${get_date_string(days_ago)}&` +
    `_u.date01=${get_date_string(0)}&` +
    `explorer-segmentExplorer.segmentId=analytics.${segmentId}&` +
    `explorer-table.filter=${filter}&` +
    "explorer-table.plotKeys=%5B%5D&explorer-table.rowStart=0&explorer-table.rowCount=100/"
  );
}

function get_date_string(days_ago: number): string {
  const date_now = new Date();
  const date_days_ago = new Date(
    date_now.getTime() - days_ago * 24 * 60 * 60 * 1000
  );
  const d = date_days_ago;
  const date_string = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map(prettify)
    .join("");
  return date_string;

  function prettify(n: number): string {
    return (n <= 9 ? "0" : "") + n;
  }
}
