import "./css/common.css";
import { load_google_analytics, track_error } from "../../views/common/tracker";
import { tab_app_name } from "../../../tab_app_info";
import { store } from "../../store";
import { customAlphabet } from "nanoid";

export default domRender;

async function domRender(goldpage_args) {
  try {
    set_id();
    await goldpage_args.page.on_page_load(goldpage_args);
  } catch (err) {
    on_error(err);
  }
}

function set_id() {
  const TAB_USER_ID = "tab_user_uid";
  if (!store.has_val(TAB_USER_ID)) {
    store.set_val(TAB_USER_ID, generate_uid());
  }
}

function generate_uid() {
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12
  );
  const uid = nanoid(); //=> "FwGcLB7eIzfy"
  return uid;
}

function on_error(err) {
  console.error(err);

  load_google_analytics();
  track_error(err);

  // Timeout to ensure event tracking happened.
  setTimeout(() => {
    alert(
      "Something went wrong. Your " +
        tab_app_name +
        ' seems to be broken; click on "Bug Repair" in the footer below to fix the problem.'
    );
  }, 2000);
}
