import { customAlphabet } from "nanoid";
import { store } from "../store";

export { get_tab_user_id };
export { init_tab_user_id };

const TAB_USER_ID = "tab_user_uid";

function get_tab_user_id() {
  init_tab_user_id();
  const tab_user_id = store.get_val(TAB_USER_ID);
  return tab_user_id;
}

function init_tab_user_id() {
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
