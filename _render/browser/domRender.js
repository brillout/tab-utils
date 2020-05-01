import "./css/common.css";
import { load_google_analytics, track_error } from "../../views/common/tracker";
import { tab_app_name } from "../../../tab_app_info";
import { init_tab_user_id } from "../../utils/TabUserId";

export default domRender;

async function domRender(goldpage_args) {
  try {
    init_tab_user_id();
    await goldpage_args.page.on_page_load(goldpage_args);
  } catch (err) {
    on_error(err);
  }
}

function on_error(err) {
  load_google_analytics();
  track_error({ name: "init", err });

  // Timeout to ensure event tracking happened.
  setTimeout(() => {
    alert(
      "Something went wrong. Your " +
        tab_app_name +
        ' seems to be broken; click on "Bug Repair" in the footer below to fix the problem.'
    );
  }, 2000);
}
