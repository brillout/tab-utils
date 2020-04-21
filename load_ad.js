import React from "react";
import assert from "@brillout/assert";
import load_script from "./private/load_script";
import remove_hash from "./private/remove_hash";
import { store } from "./store";

export { load_ad };

export { Ad_ATF, Ad_BTF };

export { ads_are_removed };

function load_ad(AD_SLOTS) {
  if (ads_are_removed()) {
    return;
  }

  load_header_bidding();

  loadAdsByGoogle();

  loadGoogleTag(AD_SLOTS);

  loadApsTag();

  fetch_bids(AD_SLOTS, { is_first_time: true });

  AD_SLOTS.forEach(({ slotID }) => {
    googletag.cmd.push(function () {
      googletag.display(slotID);
    });
  });

  setInterval(function () {
    fetch_bids(AD_SLOTS);
  }, 90000);
}

function load_header_bidding() {
  load_script("https://go.automatad.com/geo/5fkVze/afihbs.js");
}

function loadAdsByGoogle() {
  const scriptEl = load_script(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  );
  scriptEl.setAttribute("data-ad-client", "ca-pub-3994464140431603");
}

function loadGoogleTag(AD_SLOTS) {
  load_script("https://securepubads.g.doubleclick.net/tag/js/gpt.js");

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    const size_map = googletag
      .sizeMapping()
      .addSize([728, 0], [728, 90]) //desktop
      .addSize([0, 0], [320, 50]) //other
      .build();

    AD_SLOTS.forEach(({ slotID, slotName, slotSizes }) => {
      googletag
        .defineSlot(slotName, slotSizes, slotID)
        .defineSizeMapping(size_map)
        .addService(googletag.pubads());

      console.log(
        "[AD] Defined ad with id " +
          slotID +
          " name " +
          slotName +
          " and sizes " +
          slotSizes
      );
    });

    googletag.pubads().disableInitialLoad();
    // googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });
}

function fetch_bids(AD_SLOTS, { is_first_time = false } = {}) {
  const slots = AD_SLOTS.map(({ slotID, slotName, slotSizes }) => {
    return {
      slotID,
      slotName,
      sizes: slotSizes,
    };
  });
  const bid_args = { slots };
  if (!is_first_time) {
    bid_args.timeout = 2e3;
  }
  apstag.fetchBids(bid_args, function () {
    googletag.cmd.push(function () {
      apstag.setDisplayBids();
      if (!is_first_time) {
        googletag.pubads().refresh();
      }
      console.log("[AD] bid " + (is_first_time ? "init" : "refresh"));
    });
  });
}

function loadApsTag() {
  !(function (a9, a, p, s, t, A, g) {
    if (a[a9]) return;
    function q(c, r) {
      a[a9]._Q.push([c, r]);
    }
    a[a9] = {
      init: function () {
        q("i", arguments);
      },
      fetchBids: function () {
        q("f", arguments);
      },
      setDisplayBids: function () {},
      targetingKeys: function () {
        return [];
      },
      _Q: [],
    };
    A = p.createElement(s);
    A.async = !0;
    A.src = t;
    g = p.getElementsByTagName(s)[0];
    g.parentNode.insertBefore(A, g);
  })(
    "apstag",
    window,
    document,
    "script",
    "//c.amazon-adsystem.com/aax2/apstag.js"
  );

  const pubID = "f6d6bc2e-7f12-42a3-83a2-6035f3b14586";

  apstag.init({
    pubID,
    adServer: "googletag",
    bidTimeout: 2e3,
  });

  console.log("[AD] ApsTag initialized with pubID " + pubID);
}

// Since Clock/Timer Tab's source code is open anyone can read this and bypass doing a donation to remove ads.
// If you are short on money then you are more than welcome to do this :-).
function ads_are_removed() {
  if (codeIsInUrl() === true) {
    return true;
  }
  if (codeIsInLocalStorage() === true) {
    return true;
  }

  document.documentElement.classList.add("show_ad");

  return false;

  function codeIsInUrl() {
    if (window.location.hash === "#thanks-for-your-donation") {
      store.set_val("ad_removal", true);
      remove_hash();
      return true;
    }
    return false;
  }

  function codeIsInLocalStorage() {
    return store.has_val("ad_removal");
  }
}

function Ad_ATF({ ad_slots }) {
  const slots = ad_slots.filter((slot) => slot.slotName.includes("ATF"));
  assert(ad_slots.length === 2);
  assert(slots.length === 1);
  return <AdView id="primary-ad" slot={slots[0]} />;
}
function Ad_BTF({ ad_slots }) {
  const slots = ad_slots.filter((slot) => slot.slotName.includes("BTF"));
  assert(ad_slots.length === 2);
  assert(slots.length === 1);
  return <AdView id="secondary-ad" slot={slots[0]} />;
}

function AdView({ id, slot: { slotName, slotID } }) {
  assert(slotName && slotID);
  return (
    <div id={id}>
      <div className="ad-content-wrapper">
        {
          <div id={slotName}>
            <div id={slotID} />
          </div>
        }
      </div>
      <a className="ad_remover" href="donate" target="_blank">
        Remove ad
      </a>
    </div>
  );
}
