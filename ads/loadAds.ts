import assert from "@brillout/assert";
import { store } from "../store";
import {
  track_event,
  get_number_of_visits_in_the_last_24_hours,
} from "../views/common/tracker";
import { get_browser_name } from "../utils/get_browser_info";
import { disable_ezoic, enable_ezoic } from "./ezoic";
import { getElementScrollPos, addScrollListener } from "../pretty_scroll_area";
import { loadScript } from "../loadScript";
import {
  AdSlots,
  isAdsense,
  isGpt,
  getGptSlots,
  getAdsenseSlots,
  isEzoic,
  GptSizeMap,
} from "./slots";

export { loadAds };
export { user_donated };
export const AD_REMOVAL_KEY = "ad_removal";
export { disableAds };

const SHOW_DELAY = 1.3;

initAds();

function initAds() {
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

async function loadAds(adSlots: AdSlots) {
  let noAds: true | undefined;

  if (dont_show_ads(adSlots)) {
    noAds = true;
  }

  if (!noAds) {
    let success: boolean;
    if (isEzoic(adSlots)) {
      // We don't need the adSense code but we try to load it
      // in order to test if the user is using an ad blocker
      success = await loadAdsenseCode();
    } else if (isAdsense(adSlots)) {
      success = await loadAdsense(adSlots);
    } else if (isGpt(adSlots)) {
      success = await loadGpt(adSlots);
    }
    if (!success) noAds = true;
  }

  if (noAds) {
    document.documentElement.classList.add("no-ads");
  } else {
    setTimeout(() => {
      document.documentElement.classList.add("show-ads");
      enable_floating_ads();
    }, SHOW_DELAY * 1000);
  }
}

function disableAds() {
  store.set_val(AD_REMOVAL_KEY, true);
  disable_ezoic();
}

type SizeMap = {
  addSize: (
    viewport: GptSizeMap["viewport"],
    adSize: GptSizeMap["adSize"]
  ) => SizeMap;
  build: () => SizeMap;
};
type GptService = {
  enableSingleRequest: () => void;
  _brand?: "GptService";
};
type GptSlot = {
  addService: (arg: GptService) => void;
  defineSizeMapping: (arg: SizeMap) => GptSlot;
};
type GoogleTag = {
  cmd: (() => void)[];
  defineSlot: (
    adName: string,
    slotSize: [number, number],
    slotId: string
  ) => GptSlot;
  sizeMapping: () => SizeMap;
  pubads: () => GptService;
  enableServices: () => void;
  display: (slotId: string) => void;
};
declare global {
  interface Window {
    googletag: GoogleTag;
  }
}
async function loadGpt(adSlots: AdSlots): Promise<boolean> {
  const gptSlots = getGptSlots(adSlots);
  assert(gptSlots.length > 0);

  const success = await loadScript(
    "https://securepubads.g.doubleclick.net/tag/js/gpt.js",
    "gpt"
  );

  if (success) {
    window.googletag = window.googletag || ({ cmd: [] } as GoogleTag);
    window.googletag.cmd.push(function () {
      gptSlots.forEach(({ slot_id, adName, slotSize, sizeMapping }) => {
        assert(slot_id.constructor === String);
        assert(adName.constructor === String);
        assert(
          slotSize.length === 2 &&
            slotSize[0].constructor === Number &&
            slotSize[1].constructor === Number
        );

        let slot = window.googletag.defineSlot(adName, slotSize, slot_id);

        if (sizeMapping) {
          let mapping = window.googletag.sizeMapping();
          sizeMapping.forEach((map) => {
            mapping = mapping.addSize(map.viewport, map.adSize);
          });
          mapping = mapping.build();
          slot = slot.defineSizeMapping(mapping);
        }

        slot.addService(window.googletag.pubads());
      });

      window.googletag.pubads().enableSingleRequest();
      window.googletag.enableServices();

      gptSlots.forEach(({ slot_id }) => {
        window.googletag.cmd.push(function () {
          window.googletag.display(slot_id);
        });
      });
    });
  }

  return success;
}

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}
async function loadAdsense(adSlots: AdSlots): Promise<boolean> {
  const adsenseSlots = getAdsenseSlots(adSlots);
  assert(adsenseSlots.length > 0);

  const success = await loadAdsenseCode();

  if (success) {
    window.adsbygoogle = window.adsbygoogle || [];
    adsenseSlots.forEach(() => {
      window.adsbygoogle.push({});
    });
  }

  return success;
}
async function loadAdsenseCode() {
  const success = await loadScript(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "adsense"
  );
  return success;
}

// Since Clock/Timer Tab's source code is open anyone can read this and bypass doing a donation to remove ads.
// If you are short on money then you are more than welcome to do this :-).
var _user_donated: boolean;
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

function dont_show_ads(adSlots: AdSlots) {
  let disableReason =
    (user_donated() && "user_has_donated") ||
    (is_small_screen() && "screen_too_small") ||
    (ad_blocker_detected() && "ad_blocker_detected");

  if (!disableReason && !isEzoic(adSlots)) {
    disableReason =
      (is_fringe_browser() && "fringe_browser") ||
      (is_too_many_visits() && "too_many_visits");
  }

  if (disableReason) {
    trackDisableReason(disableReason);
  }

  return !!disableReason;
}

function trackDisableReason(disableReason: string) {
  let value: string;
  if (disableReason === "fringe_browser") {
    value = get_browser_name();
  }
  if (disableReason === "screen_too_small") {
    value = JSON.stringify(get_screen_size());
  }
  track_event({ name: "[adsense] disabled: " + disableReason, value });
}

function is_too_many_visits() {
  if (get_number_of_visits_in_the_last_24_hours() >= 8) {
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

var _ad_blocker_is_installed: boolean;
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

function is_nodejs() {
  return typeof window === "undefined";
}

function enable_floating_ads() {
  Array.from(document.querySelectorAll(".is_floating")).forEach(
    (el: HTMLElement) => {
      let positionOriginal = el.style.position;
      let topOriginal = el.style.top;
      let leftOriginal = el.style.left;
      let oldPosition = positionOriginal;
      let positionTopOriginal: number;
      let isFixedLayout = false;

      addScrollListener(
        (scrollPos: number) => {
          assert(scrollPos >= 0);
          const { positionLeft, positionTop } = getElementScrollPos(el);

          if (isFixedLayout) {
            assert(positionTopOriginal >= 0);
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
    }
  );
}
