import React from "react";
import Cookies from "js-cookie";
import { getPageConfig } from "../PageWrapper";
import { AD_REMOVAL_KEY, disable_ezoic } from "../../load_ad";
import { store } from "../../store";

export default getPageConfig(
  () => (
    <>
      <p>Your donation means a lot to me.</p>

      <p>
        If you have any suggestions, <a href="/suggest">let me know</a>!
      </p>

      <p>All advertisments are removed.</p>

      <p>
        Warm regards,
        <br />
        Romuald
        <br />
        <a target="_blank" className="contact-address"></a>
      </p>
    </>
  ),
  "Thank you.",
  { route: "/thanks", onPageLoad }
);

function onPageLoad() {
  disable_ads();
}
function disable_ads() {
  set_flag();
  disable_ezoic();
}
function set_flag() {
  store.set_val(AD_REMOVAL_KEY, true);
}
