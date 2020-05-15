import assert from "@brillout/assert";
import { store } from "../store";
import {
  get_number_of_visits_in_the_last_24_hours,
  track_event,
} from "../views/common/tracker";
import { get_tab_user_id } from "./TabUserId";
import { sleep } from "../sleep";

export { disable_problematic_users };
export { app_is_disabled };

const APP_IS_DISABLED = "app_is_disabled";

function disable_problematic_users() {
  assert(is_browser());
  check_and_kill_if_disabled();
}

async function set_disable_flag() {
  if (!store.has_val(APP_IS_DISABLED)) {
    const tab_user_id = get_tab_user_id();
    track_event({
      name: "app_is_disabled",
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
  if (get_number_of_visits_in_the_last_24_hours() >= 50) {
    set_disable_flag();
  }
}

function is_dev() {
  return (
    typeof window !== "undefined" && window.location.hostname === "localhost"
  );
}
