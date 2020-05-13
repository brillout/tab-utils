import "./ad_layout.css";
import "./ad_layout_left.css";
import React from "react";
import assert from "@brillout/assert";
import remove_hash from "./private/remove_hash";
import { store } from "./store";
import { LeftSide } from "./views/FullViewWrapper";
import { track_event } from "./views/common/tracker";

export { load_ads };
export { remove_ads };
export { Ad_ATF, Ad_BTF };
export { Ad_left };

init();

function Ad_left({ ad_slots, custom_ad }) {
  const content = get_content();
  if (!content) return null;
  return (
    <LeftSide style={{ backgroundColor: "#3e3e3e" }}>
      <AdHeader />
      <div className="vertical-slot-wrapper">{content}</div>
      <AdRemovalButton style={{ marginTop: 45 }} />
    </LeftSide>
  );

  function get_content() {
    if (custom_ad) {
      return custom_ad;
    }
    const slot_id = get_slot_id("LEFT_AD", ad_slots);
    if (slot_id === null) return null;
    return <AdSenseAd slot_id={slot_id} className="vertical-slot" />;
  }
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
      click-name="donate-button"
      href="/donate"
      target="_blank"
      {...props}
    >
      <span>
        Donate &<br />
        Permanantly
        <br />
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
  const slot_id = get_slot_id(slot_name, ad_slots);
  if (slot_id === null) return null;
  return (
    <div className="a-wrap">
      <div className="border-wrapper">
        <AdSenseAd
          slot_id={slot_id}
          responsive_width={true}
          className="horizontal-slot"
        />
      </div>
      <a className="donate-remover" href="donate" target="_blank">
        Remove ad
      </a>
    </div>
  );
}

function AdSenseAd({ slot_id, className, responsive_width = false }) {
  return (
    <ins
      className={"adsbygoogle " + className}
      data-ad-client="ca-pub-6953474219479917"
      data-full-width-responsive={responsive_width ? "true" : null}
      data-ad-slot={slot_id}
    ></ins>
  );
}

function get_slot_id(slot_name, ad_slots) {
  const slots = ad_slots.filter((slot) => slot.slot_name === slot_name);
  assert(slots.length <= 1);
  const slot = slots[0];
  if (!slot) return null;
  const { slot_id } = slot;
  assert(slot_id);
  return slot_id;
}
function init() {
  if (is_nodejs()) {
    return;
  }

  if (dont_show_ads()) {
    hide_ads();
  }
}

function load_ads(AD_SLOTS) {
  if (dont_show_ads()) {
    return;
  }

  show_ads();

  if (AD_SLOTS.length === 0) {
    return;
  }

  load_and_apply_ads(AD_SLOTS);
}
function remove_ads() {
  hide_ads();
}

function load_and_apply_ads(AD_SLOTS) {
  assert(AD_SLOTS.length > 0);
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
  load_script(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    () => {
      track_event({ name: "[ad]ad_code_loaded" });
    },
    () => {
      track_event({ name: "[ad]ad_code_blocked" });
      hide_ads();
    }
  );
  window.adsbygoogle = window.adsbygoogle || [];
  AD_SLOTS.forEach(() => {
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

  if (_user_donated) {
    track_event({ name: "[ad]ad_remove_donation" });
  }

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

function dont_show_ads() {
  const donation = user_donated();
  const ad_blocker = ad_blocker_exists();
  return donation || ad_blocker;
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

  if (_ad_blocker_is_installed) {
    track_event({ name: "[ad]ad_blocker_detected" });
  }

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
