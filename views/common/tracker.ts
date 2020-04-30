import assert from "@brillout/assert";
import { tab_app_google_analytics_id } from "../../../tab_app_info";
import StackTrace from "stacktrace-js";
import { get_tab_user_id } from "../../utils/TabUserId";
import { get_browser_info } from "../../utils/get_browser_info";
import throttle from "lodash.throttle";
import { store } from "../../store";

export { load_google_analytics };
export { track_event };
export { track_error };
export { track_dom_heart_beat_error };

declare global {
  interface Window {
    ga: any;
  }
}

/*/
const DEBUG = true;
/*/
const DEBUG = false;
//*/

const IS_DEV =
  typeof window !== "undefined" && window.location.hostname === "localhost";

init();

let already_loaded = false;
async function load_google_analytics() {
  if (already_loaded) return;
  already_loaded = true;
  load_script("//www.google-analytics.com/analytics.js");
  DEBUG && console.log("[GA] ga code loaded");
}

function track_user_clicks() {
  window.addEventListener(
    "click",
    (ev) => {
      const target: any = ev.target;
      const target_id = target.id;
      const target_class = target.getAttribute("class");
      const target_href = target.href;
      const target_value = target.value;
      const target_textContent = target.textContent.slice(0, 100);
      const value =
        target_id ||
        target_class ||
        target_href ||
        target_value ||
        target_textContent ||
        "null";
      const data = {
        target_id,
        target_class,
        target_href,
        target_value,
        target_textContent,
      };
      track_event({
        name: "user_click",
        value,
        data,
      });
    },
    { passive: false }
  );
}

function track_page_view() {
  window.ga("send", "pageview");
  DEBUG && console.log("[GA] page view");
}

async function track_error({ name, err }: { name: string; err: any }) {
  await send_error_event({ err, name: "[error][" + name + "]" });
}
const tracked_errors = [];
async function send_error_event({ name, err }) {
  if (tracked_errors.includes(err)) {
    return;
  }
  tracked_errors.push(err);
  console.error(err);

  const value = (err || {}).message || "no_error_message";

  const data: any = {};
  if (!err) {
    data.no_error_object = true;
  } else if (!(err.stack || err.stack__original)) {
    data.no_error_stack = true;
    data.err_obj = JSON.stringify(err, Object.getOwnPropertyNames(err));
  } else {
    data.source_mapped_stack = await get_source_mapped_stack(
      err,
      err.stack__original || err.stack
    );
  }

  track_event({
    name,
    value,
    data,
  });

  if (IS_DEV) {
    alert(data.source_mapped_stack);
  }
}
interface TrackEvent {
  name: string;
  value?: string;
  data?: Object;
  nonInteraction?: boolean;
}
async function track_event({
  name,
  value,
  data = {},
  nonInteraction = true,
}: TrackEvent) {
  const eventLabel = serialize_data(enhance_data(data, name, value));
  assert(eventLabel.startsWith("name:"));
  const eventCategory = name;
  const eventAction = name + " - " + value;

  const args = { eventCategory, eventAction, nonInteraction };

  window.ga("send", { hitType: "event", eventLabel, ...args });

  if (DEBUG) {
    DEBUG && assert.log("[GA][event]", args);
    /*
    console.log("[GA][event] eventLabel");
    console.log(eventLabel);
    //*/
  }
}

function enhance_data(data: Object, name, value): Object {
  const tab_user_id = get_tab_user_id();
  const url = window.location.href;
  const browser = get_browser_info();
  const screen = get_window_screen_sizes();
  const data_enhanced = {
    name,
    value,
    browser,
    tab_user_id,
    url,
    screen,
  };
  Object.entries(data).forEach(([key, val]) => {
    assert(!(key in data_enhanced));
    data_enhanced[key] = val;
  });
  return data_enhanced;
}
function serialize_data(data: Object) {
  return Object.entries(data)
    .map(([key, val]) => {
      return key + ": " + val;
    })
    .join("\n\n=====\n\n");
}

function init() {
  if (typeof window === "undefined") return;
  setup_ga();
  track_page_view();
  track_user_clicks();
  track_error_events();
  track_local_storage();
  track_bounce_state();
}

function setup_ga() {
  // Source:
  //  - https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference#async-unminified

  window.ga =
    window.ga ||
    function () {
      (window.ga.q = window.ga.q || []).push(arguments);
    };

  // Sets the time (as an integer) this tag was executed.
  // Used for timing hits.
  window.ga.l = +new Date();

  const ga_id = tab_app_google_analytics_id;
  assert(ga_id && ga_id.startsWith("UA-"));

  // Creates a default tracker with automatic cookie domain configuration.
  window.ga("create", ga_id, "auto");

  DEBUG && console.log("[GA] Initialized with " + ga_id);
}

// https://stackoverflow.com/questions/12571650/catching-all-javascript-unhandled-exceptions/49560222#49560222
function track_error_events() {
  window.onerror = infinite_loop_cacher(async function (...args_list) {
    load_google_analytics();

    const [message, filename, lineno, colno, error] = args_list;
    let err = error || {};
    err.message = err.message || message;
    if (!err.stack) {
      Object.assign(err, { filename, lineno, colno, noErrorObj: true });
    }
    await send_error_event({
      name: "[error][window.onerror]",
      err,
    });
  });

  window.addEventListener(
    "error",
    infinite_loop_cacher(async function (ev) {
      ev.preventDefault();

      load_google_analytics();

      const err = ev.error || {};
      err.message = err.message || ev.message;
      if (!err.stack) {
        const { filename, lineno, colno } = ev;
        Object.assign(err, { filename, lineno, colno, noErrorObj: true });
      }

      await send_error_event({
        name: "[error][ErrorEvent]",
        err,
      });
    }),
    // @ts-ignore
    { useCapture: true, passive: false }
  );

  window.addEventListener(
    "unhandledrejection",
    infinite_loop_cacher(async function (ev) {
      load_google_analytics();

      const err = ev.reason;

      await send_error_event({
        name: "[error][unhandledrejection]",
        err,
      });
    })
  );
}

function load_script(url) {
  const scriptEl = document.createElement("script");
  scriptEl.src = url;
  scriptEl.async = true;
  document.getElementsByTagName("head")[0].appendChild(scriptEl);
  return scriptEl;
}

async function get_source_mapped_stack(err, stack_trace) {
  const err_copy = new Error(err.message);
  err_copy.stack = stack_trace;

  let stackframes;
  try {
    stackframes = await StackTrace.fromError(err_copy);
  } catch (err) {
    return "[Failed applying source map to error stack trace] " + err.message;
  }

  const stringifiedStack = stackframes
    .map(function (sf) {
      return sf.toString();
    })
    .join("\n");

  return "[Error: " + err.message + "]\n" + stringifiedStack;
}

function infinite_loop_cacher(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      if (IS_DEV) {
        alert("[infinite-loop-catcher]\n" + err.stack);
      }
      console && console.error && console.error(err);

      // for window.onerror
      return true;
    }
  };
}

function get_window_screen_sizes(): string {
  return (
    window.innerWidth +
    "x" +
    window.innerHeight +
    " / " +
    window.screen.availWidth +
    "x" +
    window.screen.availHeight +
    " / " +
    window.screen.width +
    "x" +
    window.screen.height
  );
}

function track_local_storage() {
  const store_listener = throttle((key, val) => {
    track_event({
      name: "storage_change",
      value: "[" + key + "]: " + val,
      data: {
        localstorage__keys: Object.keys(window.localStorage),
        store_dump: store.backup__dump({ readable: true }),
      },
    });
  }, 2 * 1000);

  store.add_store_change_listener(store_listener);

  /*
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, val) {
    originalSetItem.apply(this, arguments);
    on_local_storage_mod(key, val);
  };

  function getSettings() {
    const settings__string = store.backup__dump({ readable: true });
    const local_storage_keys = JSON.stringify(Object.keys(window.localStorage));
    return { settings__string, local_storage_keys };
  }
  */
}

let dom_heart_beat_error_already_catched = false;
function track_dom_heart_beat_error(dom_heart_beat) {
  try {
    dom_heart_beat();
  } catch (err) {
    if (dom_heart_beat_error_already_catched === false) {
      dom_heart_beat_error_already_catched = true;
      track_error({ name: "dom_heart_beat", err });
    }
    // We don't re-throw the error in order to not block future dom beats
    console.error(err);
  }
}

function track_bounce_state() {
  const ONE_MINUTE = 60 * 1000;
  setTimeout(() => {
    track_event({ name: "five_minute_stay", nonInteraction: false });
  }, 5 * ONE_MINUTE);
}
