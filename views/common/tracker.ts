import assert from "@brillout/assert";
import { tab_app_google_analytics_id } from "../../../tab_app_info";
import StackTrace from "stacktrace-js";
import { get_tab_user_id } from "../../utils/TabUserId";
import { get_browser_info } from "../../utils/get_browser_info";
import throttle from "lodash.throttle";
import { store } from "../../store";
import { get_deploy_id } from "../../utils/get_deploy_id";

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
  !IS_DEV && window.ga("send", "pageview");
  track_event({ name: "page_view" });
  DEBUG && console.log("[GA] page view");
}

const tracked_errors = [];
async function track_error({
  name,
  err,
  value,
}: {
  name: string;
  err?: any;
  value?: string;
}) {
  if (err) {
    if (tracked_errors.includes(err)) {
      return;
    }
    tracked_errors.push(err);
  }

  if (err) {
    console.error(err);
  } else {
    console.error(name);
  }

  name = "[error]" + name;

  value = value || (err || {}).message;

  const isCrossOrigin = value === "Script error." && !(err || {}).stack;

  const noErrorInfos = !value || isCrossOrigin;

  let _eventCategory: string;
  if (noErrorInfos) {
    _eventCategory = "[error][no_infos]";
    value = "no_error_message";
  }

  const stack_info = await get_stack_info(err);
  const data = stack_info;

  track_event({
    name,
    value,
    data,
    _eventCategory,
  });

  if (IS_DEV) {
    alert(name + "\n" + stack_info.stack__source_mapped);
  }
}

async function get_stack_info(err?: any) {
  const stack_info: {
    no_error_object?: boolean;
    no_error_stack?: boolean;
    err_obj?: string;
    stack__source_mapped?: string;
    stack__original?: string;
    stack?: string;
  } = {};
  if (!err) {
    stack_info.no_error_object = true;
  } else if (!err.stack && !err.stack__processed) {
    stack_info.no_error_stack = true;
    stack_info.err_obj = JSON.stringify(err, Object.getOwnPropertyNames(err));
  } else {
    stack_info.stack__source_mapped = await get_source_mapped_stack(
      err,
      err.stack__processed || err.stack
    );
    if (err.stack__original) {
      stack_info.stack__original = err.stack__original;
    }
    stack_info.stack = err.stack;
  }
  return stack_info;
}

interface TrackEvent {
  name: string;
  value?: string;
  data?: Object;
  _eventCategory?: string;
  nonInteraction?: boolean;
}
async function track_event({
  name,
  value,
  data = {},
  _eventCategory,
  nonInteraction = true,
}: TrackEvent) {
  const eventLabel__obj = enhance_data(data, name, value);
  const eventLabel = serialize_data(eventLabel__obj);
  assert(eventLabel.startsWith("time:"));

  let eventCategory = _eventCategory || name;
  eventCategory = "[" + get_deploy_id() + "]" + eventCategory;

  let eventAction = name;
  if (value) eventAction += " - " + value;

  const args = { eventCategory, eventAction, nonInteraction };

  !IS_DEV && window.ga("send", { hitType: "event", eventLabel, ...args });

  if (DEBUG) {
    console.log("[GA][event]", eventAction, eventLabel__obj);
  }
}

function enhance_data(data: Object, name: string, value: string): Object {
  const tab_user_id = get_tab_user_id();
  const url = window.location.href;
  const browser = get_browser_info();
  const screen = get_window_screen_sizes();
  const time = get_time_string();
  const data_enhanced = {
    time,
    name,
    ...(value ? { value } : {}),
    ...(data || {}),
    browser,
    tab_user_id,
    url,
    screen,
  };
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
  !IS_DEV && window.ga("create", ga_id, "auto");

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
    await track_error({
      name: "[window.onerror]",
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

      await track_error({
        name: "[ErrorEvent]",
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

      await track_error({
        name: "[unhandledrejection]",
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
      track_error({ name: "[dom_heart_beat]", err });
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

function get_time_string(): string {
  const d = new Date();
  const time_string =
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(prettify).join("-") +
    "_" +
    [d.getHours(), d.getMinutes(), d.getSeconds()].map(prettify).join(":");
  return time_string;

  function prettify(n: number): string {
    return (n < 9 ? "0" : "") + n;
  }
}
