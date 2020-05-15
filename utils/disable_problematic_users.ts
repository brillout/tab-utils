import assert from "@brillout/assert";
import { store } from "../store";
import { get_user_visits, track_event } from "../views/common/tracker";
import { get_tab_user_id } from "./TabUserId";
import { sleep } from "../sleep";

export { disable_problematic_users };
export { app_is_disabled };
export { has_visited_main_page_x_times };

const APP_IS_DISABLED = "app_is_disabled";

function disable_problematic_users() {
  assert(is_browser());
  check_and_kill_if_disabled();
}

async function set_disable_flag() {
  if (!store.has_val(APP_IS_DISABLED)) {
    const tab_user_id = get_tab_user_id();
    track_event({
      name: "app_disabled__aggressive_autoreload",
      value: tab_user_id,
    });
    store.set_val(APP_IS_DISABLED, true);
    await sleep({ seconds: 1 }); // Give browser time to send track event HTTP request
  }
  kill_app();
}

function check_and_kill_if_disabled() {
  if (app_is_disabled()) {
    kill_app();
  } else {
    disable_if_aggressive_autoreload_user();
  }
}

function kill_app() {
  const TARGET_PAGE = "/contact";
  if (is_dev()) return;
  if (window.location.pathname === TARGET_PAGE) return;
  alert(
    "You have been deactivated. Please contact Romuald, he will let you know why, and how to solve the problem."
  );
  window.location.pathname = TARGET_PAGE;
}

function app_is_disabled() {
  const app_is_disabled = store.get_val(APP_IS_DISABLED);
  assert([true, undefined].includes(app_is_disabled), { app_is_disabled });
  return app_is_disabled;
}

function is_browser() {
  return typeof window !== "undefined";
}

function disable_if_aggressive_autoreload_user() {
  const LIMIT = 50;
  if (has_visited_main_page_x_times(LIMIT)) {
    set_disable_flag();
  }
}

function has_visited_main_page_x_times(x: number): boolean {
  const user_visits = get_user_visits();
  const in_24_hours_ago = new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000
  ).getTime();
  if (
    user_visits.length > x &&
    user_visits
      .slice(-1 * x)
      .every((visit: Date) => visit.getTime() > in_24_hours_ago)
  ) {
    return true;
  }
  return false;
}

function is_dev() {
  return (
    typeof window !== "undefined" && window.location.hostname === "localhost"
  );
}
