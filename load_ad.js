import "./ad_layout.css";
import "./ad_layout_left.css";
import React from "react";
import assert from "@brillout/assert";
import remove_hash from "./private/remove_hash";
import { store } from "./store";
import {
  track_event,
  get_number_of_visits_in_the_last_24_hours,
} from "./views/common/tracker";
import { get_browser_name } from "./utils/get_browser_info";
import { enable_products_view } from "./ads/Products/ProductsView";
import { app_is_disabled } from "./utils/disable_problematic_users";

export { load_ads };
export { Ad_ATF, Ad_BTF };
export { Ad_left };
export { user_donated };
export { get_product_slots };

init();

function init() {
  if (is_nodejs()) {
    return;
  }
  if (user_donated()) {
    document.documentElement.classList.add("user-donated");
  }
}

function Ad_left({ ad_slots }) {
  const slot_id = get_adsense_slot_id("LEFT_AD", ad_slots);
  if (slot_id === null) return null;
  return (
    <div id="left-slot">
      <AdHeader />
      <div className="vertical-slot-wrapper">
        <AdSenseAd slot_id={slot_id} />;
      </div>
      <AdRemovalButton style={{ marginTop: 45 }} />
    </div>
  );
}

function AdHeader() {
  return (
    <div
      style={{
        height: 61,
        fontWeight: 300,
        width: "100%",
        color: "#aaa",
        fontSize: "0.95em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="unselectable"
    >
      Advertisement
    </div>
  );
}
function AdRemovalButton(props) {
  return (
    <a
      className="donate-remover-2 glass-background glass-background-button"
      click-name="donate-button-left"
      href="/donate"
      target="_blank"
      {...props}
    >
      <span id="left-donate-icon"></span>
      <span id="left-donate-text">
        Donate &<br />
        Remove ads
      </span>
    </a>
  );
}

function Ad_ATF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"ATF"} />;
}
function Ad_BTF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"BTF"} />;
}

function AdView({ ad_slots, slot_name }) {
  assert(["ATF", "BTF"].includes(slot_name));
  const slot_id = get_adsense_slot_id(slot_name, ad_slots);
  if (slot_id === null) return null;
  return (
    <div className="a-wrap">
      <div className="horizontal-slot-wrapper">
        <AdSenseAd slot_id={slot_id} responsive_width={true} />
      </div>
      <a className="donate-remover" href="donate" target="_blank">
        Remove ad
      </a>
    </div>
  );
}

function AdSenseAd({ slot_id, responsive_width = false }) {
  return (
    <ins
      className="adsbygoogle"
      data-ad-client="ca-pub-6953474219479917"
      data-full-width-responsive={responsive_width ? "true" : null}
      data-ad-slot={slot_id}
    ></ins>
  );
}

function get_adsense_slot_id(slot_name, ad_slots) {
  const adsense_slots = get_adsense_slots(ad_slots).filter((slot) => {
    assert(slot_name);
    assert(slot.slot_name);
    return slot.slot_name === slot_name;
  });
  assert(adsense_slots.length <= 1);
  const slot = adsense_slots[0];
  if (!slot) return null;
  const { slot_id } = slot;
  assert(slot_id);
  return slot_id;
}

function get_adsense_slots(AD_SLOTS) {
  return filter_slots(AD_SLOTS, (slot) => slot.is_adsense);
}
function get_product_slots(AD_SLOTS) {
  const product_slots = filter_slots(AD_SLOTS, (slot) => slot.is_product);
  return product_slots;
}
function get_custom_slot(AD_SLOTS) {
  const slots__match = filter_slots(AD_SLOTS, (slot) => slot.is_custom);
  if (slots__match.length === 0) {
    return null;
  }
  assert(slots__match.length === 1);
  const custom_slot = slots__match[0];
  assert(custom_slot.is_custom === true);
  return custom_slot;
}
function filter_slots(AD_SLOTS, fn) {
  return AD_SLOTS.filter((slot) => {
    assert([true, undefined].includes(slot.is_adsense));
    assert([true, undefined].includes(slot.is_custom));
    assert([true, undefined].includes(slot.is_product));
    assert(
      (slot.is_adsense ? 1 : 0) +
        (slot.is_custom ? 1 : 0) +
        (slot.is_product ? 1 : 0) ===
        1
    );
    const res = fn(slot);
    assert([true, undefined].includes(res));
    return !!res;
  });
}

function load_ads(AD_SLOTS) {
  if (!dont_show_adsense()) {
    load_and_show_adsense(AD_SLOTS);
    return;
  }

  if (!dont_show_custom()) {
    load_custom_banner(AD_SLOTS);
    return;
  }
}

function load_custom_banner(AD_SLOTS) {
  const custom_slot = get_custom_slot(AD_SLOTS);

  if (custom_slot === null) {
    return;
  }

  const left_slot = document.querySelector("#left-slot");
  assert(left_slot, "couldn't find left_slot");

  left_slot.classList.add("custom-banner");

  const vertical_slot_wrapper = left_slot.querySelector(
    ".vertical-slot-wrapper"
  );
  assert(vertical_slot_wrapper, "couldn't find vertical_slot_wrapper");

  const { img_src, click_name, slot_name, is_custom } = custom_slot;
  assert(img_src);
  assert(click_name === "monitor_banner");
  assert(slot_name === "LEFT_AD");
  assert(is_custom === true);

  vertical_slot_wrapper.innerHTML = `
    <img
      click-name="${click_name}"
      src="${img_src}"
      id="custom-banner"
    />
  `;

  enable_products_view(custom_slot);

  setTimeout(show_ads, 1000);

  track_event({ name: "[custom-ad] loaded" });
}

function load_and_show_adsense(AD_SLOTS) {
  const adsense_slots = get_adsense_slots(AD_SLOTS);

  if (adsense_slots.length === 0) {
    return;
  }

  show_ads();

  load_script(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    () => {
      track_event({ name: "[adsense] adsbygoogle.js loaded" });
    },
    () => {
      track_event({ name: "[adsense] adsbygoogle.js blocked" });
      hide_ads();
    }
  );

  /*
declare global {
  interface Window {
    adsbygoogle: any;
  }
}
*/
  window.adsbygoogle = window.adsbygoogle || [];
  adsense_slots.forEach(() => {
    window.adsbygoogle.push({});
  });
}

// Since Clock/Timer Tab's source code is open anyone can read this and bypass doing a donation to remove ads.
// If you are short on money then you are more than welcome to do this :-).
var _user_donated;
function user_donated() {
  assert(!is_nodejs());

  if (_user_donated !== undefined) {
    assert([true, false].includes(_user_donated));
    return _user_donated;
  }

  _user_donated = check_donation();
  assert([true, false].includes(_user_donated));

  return _user_donated;

  function check_donation() {
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

    return false;
  }
}

function dont_show_custom() {
  return user_donated() || ad_blocker_exists() || is_small_screen();
}

function dont_show_adsense() {
  const disable_reason =
    (user_donated() && "user_has_donated") ||
    (ad_blocker_exists() && "ad_blocker_detected") ||
    (is_small_screen() && "screen_too_small") ||
    (is_fringe_browser() && "fringe_browser") ||
    (is_too_many_visits() && "too_many_visits");

  if (disable_reason) {
    {
      let value;
      if (disable_reason === "fringe_browser") {
        value = get_browser_name();
      }
      if (disable_reason === "screen_too_small") {
        value = JSON.stringify(get_screen_size());
      }
      track_event({ name: "[adsense]disabled__" + disable_reason, value });
    }

    return true;
  }

  return false;
}

function is_too_many_visits() {
  if (get_number_of_visits_in_the_last_24_hours() >= 8) {
    return true;
  }
  if (app_is_disabled()) {
    assert(false);
    return true;
  }
  return false;
}

function is_small_screen() {
  const { width } = get_screen_size();
  // Same as CSS media query
  return width <= 700;
}

function get_screen_size() {
  const { width, height } = window.screen;
  assert(
    Number.isInteger(width) &&
      width > 0 &&
      Number.isInteger(height) &&
      height > 0,
    { width, height }
  );
  return { width, height };
}

function is_fringe_browser() {
  const browser_name = get_browser_name();
  return ![
    "chrome",
    "chromium",
    "safari",
    "firefox",
    "internet explorer",
    "opera",
    "edge",
    "microsoft edge",
  ].includes(browser_name.toLowerCase());
}

var _ad_blocker_is_installed;
function ad_blocker_exists() {
  assert(!is_nodejs());

  if (_ad_blocker_is_installed !== undefined) {
    return _ad_blocker_is_installed;
  }

  const ad_blocker_test = document.createElement("div");

  // hide
  ad_blocker_test.style.position = "absolute";
  ad_blocker_test.style.visibility = "hidden";
  ad_blocker_test.style.pointerEvents = "none";

  ad_blocker_test.innerHTML = "some_text";

  // Ad blockers hide elements with that class
  ad_blocker_test.className = "adsbygoogle";

  document.body.appendChild(ad_blocker_test);
  _ad_blocker_is_installed = ad_blocker_test.offsetHeight === 0;
  document.body.removeChild(ad_blocker_test);

  return _ad_blocker_is_installed;
}

function load_script(url, onload, onerror) {
  const scriptEl = document.createElement("script");
  scriptEl.src = url;
  scriptEl.async = true;
  scriptEl.onload = onload;
  scriptEl.onerror = onerror;
  document.getElementsByTagName("head")[0].appendChild(scriptEl);
}

function show_ads() {
  document.documentElement.classList.add("show-ads");
}
function hide_ads() {
  document.documentElement.classList.remove("show-ads");
}

function is_nodejs() {
  return typeof window === "undefined";
}
