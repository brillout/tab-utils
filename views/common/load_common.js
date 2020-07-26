import activate_email_links from "./activate_email_links";
import activate_app from "./activate_app";
import { load_google_analytics } from "./tracker";
import init_wake_lock from "./init_wake_lock";
import { disable_problematic_users } from "../../utils/disable_problematic_users";

export default load_common;

function load_common() {
  activate_email_links();

  activate_app();

  try {
    init_wake_lock();
  } catch (e) {}

  load_google_analytics();

  disable_problematic_users();
}
