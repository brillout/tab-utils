import "./ad_layout.css";
import "./ad_layout_left.css";
import "./ad_layout_btf.css";
import React from "react";
import assert from "@brillout/assert";
import { store } from "./store";
import {
  track_event,
  get_number_of_visits_in_the_last_24_hours,
} from "./views/common/tracker";
import { get_browser_name } from "./utils/get_browser_info";
import { enable_products_view } from "./ads/Products/ProductsView";
import { app_is_disabled } from "./utils/disable_problematic_users";
import { tab_app_google_adsense } from "../tab_app_info";
import { disable_ezoic, enable_ezoic } from "./ads/ezoic.ts";
import { getElementScrollPos, addScrollListener } from "./pretty_scroll_area";

export { load_ads };
export { Ad_ATF, Ad_BTF };
export { Ad_btf_2 };
export { Ad_left };
export { user_donated };
export { get_product_slots };
export const AD_REMOVAL_KEY = "ad_removal";
export { disable_ads };

const SHOW_DELAY = 1.3;

init();

function init() {
  if (is_nodejs()) {
    return;
  }

  thanks_page_redirection();

  const donated = user_donated();

  if (donated) {
    document.documentElement.classList.add("user-donated");
  }

  if (donated) {
    disable_ezoic();
  } else {
    enable_ezoic();
  }
}

async function load_ads(AD_SLOTS) {
  if (!(await dont_show_adsense(AD_SLOTS))) {
    await enable_adsense(AD_SLOTS);
    assert(!(await dont_show_ads()));
  }

  if (await dont_show_ads()) {
    document.documentElement.classList.add("ads-are-disabled");
  } else {
    setTimeout(() => {
      document.documentElement.classList.add("show-ads");
      enable_floating_ads();
    }, SHOW_DELAY * 1000);
  }
}

function disable_ads() {
  store.set_val(AD_REMOVAL_KEY, true);
  disable_ezoic();
}

function Ad_left({ ad_slots }) {
  const slot_left_atf = get_left_slot("LEFT_AD_ATF", ad_slots);
  const slot_left_btf = get_left_slot("LEFT_AD_BTF", ad_slots);
  assert(slot_left_atf);
  assert(slot_left_btf);

  return (
    <div id="ads-left">
      {slot_left_atf}
      {slot_left_btf}
    </div>
  );
}

function get_left_slot(slot_name, ad_slots) {
  let content;
  let is_floating;
  {
    const adsense_id = get_adsense_slot_id(slot_name, ad_slots);
    if (adsense_id) {
      content = <AdSenseAd slot_id={adsense_id} />;
    }
  }

  {
    const ezoic_slot = get_ezoic_slot(slot_name, ad_slots);
    if (ezoic_slot) {
      const ezoic_id = ezoic_slot.slot_id;
      content = <EzoicAd ezoic_id={ezoic_id} />;

      is_floating = ezoic_slot.is_floating;
      assert([true, undefined].includes(is_floating));
    }
  }

  if (!content) {
    return null;
  }

  return (
    <div className="slot-left">
      <div
        className={
          "vertical-slot-wrapper" + (is_floating ? " is_floating" : "")
        }
      >
        {content}
      </div>
    </div>
  );
}

function Ad_btf_2({ ad_slots }) {
  const slot_name = "BTF_2";
  const className = "slot_btf";

  let slot_content;
  {
    const adsense_id = get_adsense_slot_id(slot_name, ad_slots);
    if (adsense_id) {
      slot_content = (
        <AdSenseAd
          className={className}
          slot_id={adsense_id}
          auto_sizing={"horizontal"}
        />
      );
    }
  }

  {
    const ezoic_slot = get_ezoic_slot(slot_name, ad_slots);
    if (ezoic_slot) {
      assert(slot_content === undefined);
      const ezoic_id = ezoic_slot.slot_id;
      slot_content = <EzoicAd ezoic_id={ezoic_id} className={className} />;
    }
  }

  if (!slot_content) {
    return null;
  }

  let slot_wrapper = (
    <div className="slot_btf_container">
      <div className="slot_btf_wrapper">{slot_content}</div>
    </div>
  );
  return slot_wrapper;
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
        <AdSenseAd slot_id={slot_id} />
      </div>
    </div>
  );
}

function EzoicAd({ ezoic_id, className }) {
  assert(ezoic_id);
  assert(ezoic_id.startsWith("ezoic-pub-ad-placeholder-1"));
  className = "ezoic-ad-slot " + (className || "");
  return (
    <div className={className}>
      <div id={ezoic_id} />
      <div className="ezoic-dev-demo" />
    </div>
  );
}

function AdSenseAd({ slot_id, className, auto_sizing }) {
  assert(tab_app_google_adsense.startsWith("ca-pub-"));
  assert(auto_sizing === undefined || ["horizontal"].includes(auto_sizing));

  className = "adsbygoogle " + (className || "");

  const props = {};
  if (auto_sizing) {
    Object.assign(props, {
      "data-ad-format": auto_sizing,
      "data-full-width-responsive": true,
    });
  }

  return (
    <ins
      className={className}
      data-ad-client={tab_app_google_adsense}
      data-ad-slot={slot_id}
      {...props}
    ></ins>
  );
}

function get_ezoic_slot(slot_name, ad_slots) {
  const ezoic_slots = get_ezoic_slots(ad_slots).filter((slot) => {
    assert(slot_name);
    assert(slot.slot_name);
    return slot.slot_name === slot_name;
  });
  assert(ezoic_slots.length <= 1);
  const slot = ezoic_slots[0];
  if (!slot) return null;
  const { slot_id } = slot;
  assert(slot_id);
  return slot;
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

function get_ezoic_slots(AD_SLOTS) {
  return filter_slots(AD_SLOTS, (slot) => slot.is_ezoic);
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
    assert([true, undefined].includes(slot.is_ezoic));
    assert(
      (slot.is_adsense ? 1 : 0) +
        (slot.is_custom ? 1 : 0) +
        (slot.is_product ? 1 : 0) +
        (slot.is_ezoic ? 1 : 0) ===
        1
    );
    const res = fn(slot);
    assert([true, undefined].includes(res));
    return !!res;
  });
}

function load_custom_banner(AD_SLOTS) {
  const custom_slot = get_custom_slot(AD_SLOTS);

  if (custom_slot === null) {
    return;
  }

  const left_slot = document.querySelector(".slot-left");
  assert(left_slot, "couldn't find left_slot");

  left_slot.classList.add("custom-banner");

  const vertical_slot_wrapper = left_slot.querySelector(
    ".vertical-slot-wrapper"
  );
  assert(vertical_slot_wrapper, "couldn't find vertical_slot_wrapper");

  const { img_src, click_name, slot_name, is_custom } = custom_slot;
  assert(img_src);
  assert(click_name === "monitor_banner");
  assert(slot_name === "LEFT_AD_ATF");
  assert(is_custom === true);

  vertical_slot_wrapper.innerHTML = `
    <img
      click-name="${click_name}"
      src="${img_src}"
      id="custom-banner"
    />
  `;

  enable_products_view(custom_slot);

  //show_ads();

  track_event({ name: "[custom-ad] activated" });
}

async function enable_adsense(AD_SLOTS) {
  const adsense_slots = get_adsense_slots(AD_SLOTS);
  assert(adsense_slots.length > 0);

  const success = await load_adsense_code();
  assert(success === true, { success });

  window.adsbygoogle = window.adsbygoogle || [];
  adsense_slots.forEach(() => {
    window.adsbygoogle.push({});
  });

  track_event({ name: "[adsense] activated" });
}

var adsense_code_load_promise;
function load_adsense_code() {
  if (adsense_code_load_promise !== undefined) return adsense_code_load_promise;
  let resolve;
  let already_resolved = false;
  adsense_code_load_promise = new Promise((_resolve) => {
    resolve = (success) => {
      assert([true, false].includes(success));
      if (already_resolved) return;
      already_resolved = true;
      _resolve(success);
    };
  });
  assert(resolve);

  load_script(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    () => {
      track_event({ name: "[adsense] adsbygoogle.js loaded" + add_addendum() });
      resolve(true);
    },
    () => {
      track_event({
        name: "[adsense] adsbygoogle.js blocked" + add_addendum(),
      });
      resolve(false);
    }
  );
  setTimeout(() => {
    if (already_resolved) return;
    track_event({ name: "[adsense] adsbygoogle.js timeout" });
    resolve(false);
  }, 5 * 1000);

  return adsense_code_load_promise;

  function add_addendum() {
    const addendum = already_resolved ? " [after-timeout]" : "";
    return addendum;
  }
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
    return store.has_val(AD_REMOVAL_KEY);
  }
}

function thanks_page_redirection() {
  if (window.location.hash === "#thanks-for-your-donation") {
    window.location.href = window.location.origin + "/thanks";
  }
}

async function dont_show_ads() {
  return (
    user_donated() ||
    is_small_screen() ||
    ad_blocker_detected() ||
    (await ad_blocked())
  );
}

async function dont_show_adsense(AD_SLOTS) {
  const disable_reason =
    (user_donated() && "user_has_donated") ||
    (ad_blocker_detected() && "ad_blocker_detected") ||
    (is_small_screen() && "screen_too_small") ||
    (is_fringe_browser() && "fringe_browser") ||
    (is_too_many_visits() && "too_many_visits") ||
    ((await ad_blocked()) && "ad_blocked") ||
    (no_adsense_slots(AD_SLOTS) && "no_adsense_slots");

  if (disable_reason) {
    {
      let value;
      if (disable_reason === "fringe_browser") {
        value = get_browser_name();
      }
      if (disable_reason === "screen_too_small") {
        value = JSON.stringify(get_screen_size());
      }
      track_event({ name: "[adsense] disabled: " + disable_reason, value });
    }

    return true;
  }

  return false;
}

function no_adsense_slots(AD_SLOTS) {
  const adsense_slots = get_adsense_slots(AD_SLOTS);
  return adsense_slots.length === 0;
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
function ad_blocker_detected() {
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

async function ad_blocked() {
  const success = await load_adsense_code();
  assert([true, false].includes(success));
  return !success;
}

function load_script(url, onload, onerror) {
  const scriptEl = document.createElement("script");
  scriptEl.src = url;
  scriptEl.async = true;
  scriptEl.onload = onload;
  scriptEl.onerror = onerror;
  document.getElementsByTagName("head")[0].appendChild(scriptEl);
}

function is_nodejs() {
  return typeof window === "undefined";
}

function enable_floating_ads() {
  Array.from(document.querySelectorAll(".is_floating")).forEach((el) => {
    let positionOriginal = el.style.position;
    let topOriginal = el.style.top;
    let leftOriginal = el.style.left;
    let oldPosition = positionOriginal;
    let positionTopOriginal;
    let isFixedLayout = false;

    addScrollListener(
      (scrollPos) => {
        assert(scrollPos >= 0);
        const { positionLeft, positionTop } = getElementScrollPos(el);

        if (isFixedLayout) {
          assert(positionTopOriginal);
          isFixedLayout = scrollPos > positionTopOriginal;
        } else {
          isFixedLayout = scrollPos > positionTop;
          positionTopOriginal = positionTop;
        }

        const newPosition = isFixedLayout ? "fixed" : positionOriginal;

        if (newPosition !== oldPosition) {
          if (newPosition === "fixed") {
            el.style.position = newPosition;
            el.style.top = "0px";
            el.style.left = positionLeft + "px";
          } else {
            el.style.position = positionOriginal;
            el.style.top = topOriginal;
            el.style.left = leftOriginal;
          }
          oldPosition = newPosition;
        }
      },
      { fireInitialScroll: true, onlyUserScroll: false }
    );
  });
}
