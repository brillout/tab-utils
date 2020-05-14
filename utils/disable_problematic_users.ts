import assert from "@brillout/assert";
import { store } from "../store";
import { get_user_visits } from "../views/common/tracker";

export { disable_problematic_users };

const APP_IS_DISABLED = "app_is_disabled";

function disable_problematic_users() {
  assert(is_browser());
  check_and_kill_if_disabled();
}

function set_disable_flag() {
  store.set_val(APP_IS_DISABLED, true);
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
  const user_visits = get_user_visits();
  const in_24_hours_ago = new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000
  ).getTime();
  const LIMIT = 15;
  if (
    user_visits.length > LIMIT &&
    user_visits
      .slice(-1 * LIMIT)
      .every((visit: Date) => visit.getTime() > in_24_hours_ago)
  ) {
    set_disable_flag();
  }
}

function is_dev() {
  return (
    typeof window !== "undefined" && window.location.hostname === "localhost"
  );
}
