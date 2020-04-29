import "./ad_layout.css";
import React from "react";
import assert from "@brillout/assert";
import load_script from "./private/load_script";
import remove_hash from "./private/remove_hash";
import { store } from "./store";

export { load_ad };

export { Ad_ATF, Ad_BTF };

export { ads_are_removed };

function Ad_ATF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"ATF"} />;
}
function Ad_BTF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"BTF"} />;
}

function AdView({ id, ad_slots, slot_name }) {
  assert(["ATF", "BTF"].includes(slot_name));
  const slots = ad_slots.filter((slot) => slot.slot_name === slot_name);
  assert(ad_slots.length === 2);
  assert(slots.length === 1);
  const { slot_id } = slots[0];
  assert(slot_id);
  return (
    <div className="a-wrap">
      <div className="border-wrapper">
        <ins
          className="adsbygoogle"
          data-ad-client="ca-pub-6953474219479917"
          data-full-width-responsive="true"
          data-ad-slot={slot_id}
        ></ins>
      </div>
      <a className="donate-remover" href="donate" target="_blank">
        Remove ad
      </a>
    </div>
  );
}

function load_ad(AD_SLOTS) {
  if (ads_are_removed()) {
    return;
  }

  loadAdsByGoogle(AD_SLOTS);
}

/*
declare global {
  interface Window {
    adsbygoogle: any;
  }
}
*/
function loadAdsByGoogle(AD_SLOTS) {
  const scriptEl = load_script(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  );
  window.adsbygoogle = window.adsbygoogle || [];
  AD_SLOTS.forEach(() => {
    window.adsbygoogle.push({});
  });
}

// Since Clock/Timer Tab's source code is open anyone can read this and bypass doing a donation to remove ads.
// If you are short on money then you are more than welcome to do this :-).
function ads_are_removed() {
  const AD_REMOVAL_KEY = "ad_removal";

  const code_in_storage = store.has_val(AD_REMOVAL_KEY);

  if (window.location.hash === "#thanks-for-your-donation") {
    if (!code_in_storage) {
      store.set_val(AD_REMOVAL_KEY, true);
    }
    remove_hash();
    return true;
  }

  if (code_in_storage) {
    return true;
  }

  document.documentElement.classList.add("show_ad");

  return false;
}
