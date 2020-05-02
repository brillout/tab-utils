import load_common from "../common/load_common";
import pretty_scroll_area from "../../pretty_scroll_area";
import { activate_screen_buttons } from "./screen-buttons";

export default on_page_load;

async function on_page_load(onPageLoad, goldpage_args) {
  await onPageLoad(() => {
    load_full_view();
    load_common();
  }, goldpage_args);
}

function load_full_view() {
  pretty_scroll_area();

  activate_screen_buttons();
}
