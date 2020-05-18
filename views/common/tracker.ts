import assert from "@brillout/assert";
import { tab_app_google_analytics_id } from "../../../tab_app_info";
import StackTrace from "stacktrace-js";
import { DateTime } from "luxon";
import { get_tab_user_id } from "../../utils/TabUserId";
import {
  get_browser_info,
  get_browser_name,
} from "../../utils/get_browser_info";
import throttle from "lodash.throttle";
import { store } from "../../store";
import { get_deploy_id } from "../../utils/get_deploy_id";
import { app_is_disabled } from "../../utils/disable_problematic_users";

export { load_google_analytics };
export { track_event };
export { track_error };
export { track_dom_heart_beat_error };
export { get_number_of_visits_in_the_last_24_hours };

declare global {
  interface Window {
    ga: any;
  }
}

//*/
const DEBUG = false;
/*/
const DEBUG = true;
//*/

const IS_DEV =
  typeof window !== "undefined" && window.location.hostname === "localhost";

const DATE_FORMAT = "yyyy-LL-dd";

init();

function track_user_clicks() {
  window.addEventListener(
    "click",
    (ev) => {
      const target: any = ev.target;
      const target_tagName = target.tagName;
      const target_id = target.id;
      const target_class = target.getAttribute("class");
      const target_href = target.href;
      const target_src = target.src;
      const target_value = target.value;
      const target_textContent = target.textContent.slice(0, 100);

      const click_name = get_click_name(target);

      const value =
        target_id ||
        target_class ||
        target_href ||
        target_src ||
        target_value ||
        target_textContent ||
        target_tagName ||
        "null";

      const data = {
        click_name,
        target_id,
        target_class,
        target_href,
        target_src,
        target_value,
        target_textContent,
        target_tagName,
      };

      let name = "[click]";
      if (click_name) name += click_name;

      track_event({
        name,
        value,
        data,
      });
    },
    // Make sure that request to Google Analytics is sent before page navigates to advertisement
    { passive: false }
  );

  function get_click_name(el: Node) {
    while (true) {
      if ("getAttribute" in el) {
        const click_name = (el as HTMLElement).getAttribute("click-name");
        if (click_name) return click_name;
      }
      el = el.parentNode;
      if (!el) return null;
    }
  }
}

function track_page_view() {
  !IS_DEV && window.ga("send", "pageview");
  track_event({ name: "page_view" });
  DEBUG && console.log("[GA] page view");
}

var tracked_errors: any[];
async function track_error({
  name,
  err,
  value,
}: {
  name: string;
  err?: any;
  value?: string;
}) {
  tracked_errors = tracked_errors || [];
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

  let _eventCategory: string;
  if (!value) {
    if (is_browser_extension_error(err)) {
      _eventCategory = "[third-party-error][browser-extension]";
    }
    if (is_from_inline_js(err)) {
      _eventCategory = "[third-party-error][inline-js]";
    }
    if (is_cross_origin_error(err)) {
      _eventCategory = "[third-party-error][cross-origin]";
    }
    if (is_whitelist_error(err)) {
      _eventCategory = "[third-party-error][whitelist]";
    }
  }

  value = value || (err || {}).message;

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

function is_cross_origin_error(err: any) {
  if (!err) {
    return false;
  }
  if (!err.stack && err.message === "Script error.") {
    return true;
  }

  return false;
}
function is_from_inline_js(err: any) {
  // The idea here is that errors from JavaScript inlined in HTML can't originate from app code,
  // since my app code doesn't have any inline JS.
  // Most likely it's JavaScript code injected by browser extensions.

  if (!err) {
    return false;
  }

  const stack_lines = (err.stack ? err.stack.split("\n") : []).filter(Boolean);
  if (stack_lines.length > 2 || stack_lines.length === 0) {
    return false;
  }

  assert(stack_lines.length === 1 || stack_lines.length === 2);

  const stack_line_1 = stack_lines[0];
  const stack_line_2 = stack_lines[1];

  const { origin, pathname } = window.location;
  assert(pathname.startsWith("/"));
  const html_url = origin + pathname;

  // Example:
  // ~~~
  // ReferenceError: SetEvent is not defined
  //   at https://www.clocktab.com/:1:1
  // ~~~
  if (stack_line_2 && stack_line_2.trim().startsWith("at " + html_url + ":")) {
    return true;
  }

  // Example:
  // ~~~
  // TypeError: this.remove is not a function
  //  at <anonymous>:12:14
  // ~~~
  if (stack_line_2 && stack_line_2.trim().startsWith("at <anonymous>:")) {
    return true;
  }

  // Weird Firefox Error format, example:
  // ~~~
  // assert(err.message === 'can't redefine non-configurable property "userAgent"');
  // assert(err.stack === '@https://www.clocktab.com/:1:635'):
  // ~~~
  if (!stack_line_2 && stack_line_1.startsWith("@" + html_url + ":")) {
    return true;
  }

  /* I suspect that the following is already covered by the code block above.
  // I'm not sure if this is really a cross origin error.
  // Maybe it's a browser extension that erroneously loads HTML with a script tag.
  if (
    [
      "SyntaxError: Unexpected token '<'",
      "SyntaxError: Unexpected token <",
    ].includes(err.stack)
  ) {
    return true;
  }
  */

  return false;
}
function is_browser_extension_error(err: any) {
  if (!err || !err.stack || !err.stack.includes) {
    return false;
  }

  const browser_name = get_browser_name();
  if (!browser_name) {
    return false;
  }

  // I've seen such browser extension errors for Chrome and Safari but not for other browsers (yet?)
  return err.stack.includes(browser_name.toLowerCase() + "-extension://");
}
function is_whitelist_error(err: any) {
  if (!err) {
    return false;
  }

  const browser_name = get_browser_name();

  // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
  if (
    browser_name === "Chrome" &&
    !err.stack &&
    err.message === "ResizeObserver loop limit exceeded"
  ) {
    return true;
  }

  return false;
}

interface TrackEvent {
  name: string;
  value?: string;
  data?: Object;
  _eventCategory?: string;
  nonInteraction?: boolean;
}
function track_event({
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
  const deploy_id = get_deploy_id();
  const data_enhanced = {
    time,
    name,
    ...(value ? { value } : {}),
    ...(data || {}),
    browser,
    tab_user_id,
    url,
    screen,
    deploy_id,
  };
  return data_enhanced;
}
function serialize_data(data: Object) {
  return Object.entries(data)
    .map(([key, val]) => {
      // GA doesn't show new lines
      if (val && val.constructor === String) {
        val = val.split("\n").join("\\n");
      }
      return key + ": " + val;
    })
    .join(" ===== ");
}

function init() {
  if (typeof window === "undefined") return;

  if (app_is_disabled()) {
    return;
  }

  setup_ga();
  track_page_view();
  track_user_clicks();
  track_error_events();
  track_storage();
  track_session_duration();
  {
    const { pathname } = window.location;
    assert(pathname.startsWith("/"));
    if (pathname === "/") {
      track_visited_days();
      track_last_24_hours_visits();
    }
  }
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

async function track_err_event(eventSource: string, err: any) {
  if (err.stack__processed) {
    eventSource = "assert";
  }
  await track_error({ name: "[" + eventSource + "]", err });
}

// https://stackoverflow.com/questions/12571650/catching-all-javascript-unhandled-exceptions/49560222#49560222
function track_error_events() {
  window.onerror = infinite_loop_cacher(async function (...args_list) {
    load_google_analytics();

    const [message, filename, lineno, colno, error] = args_list;
    let err: any;
    if (error) {
      err = error;
    } else {
      err = { message, filename, lineno, colno, noErrorObj: true };
    }
    await track_err_event("window.onerror", err);
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

      await track_err_event("ErrorEvent", err);
    }),
    // @ts-ignore
    { useCapture: true, passive: false }
  );

  window.addEventListener(
    "unhandledrejection",
    infinite_loop_cacher(async function (ev) {
      load_google_analytics();

      const err = ev.reason;

      await track_err_event("unhandledrejection", err);
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

function track_storage() {
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
function track_dom_heart_beat_error(dom_heart_beat: () => {}) {
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

function track_visited_days() {
  const FIVE_MINUTES = 5 * 60 * 1000;
  setTimeout(track_visit, FIVE_MINUTES);

  function track_visit() {
    const VISITED_DAYS = "visited_days";

    const visited_days: string[] = store.get_val(VISITED_DAYS) || [];
    const today_string = get_date_string();
    if (!today_string) {
      return;
    }
    if (visited_days.includes(today_string)) {
      return;
    }
    visited_days.push(today_string);
    store.set_val(VISITED_DAYS, visited_days, { is_passive: true });

    track_event({
      name: "[visitors][" + today_string + "]",
      value: "visited days: " + prettify_number_of_visits(visited_days.length),
    });
  }
}
function prettify_number_of_visits(n: number): string {
  return (n < 10 && n + "") || ((n / 10) | 0) + "x";
}

function track_session_duration(
  minutes_so_far: number = 0,
  minutes_until_next_track_event: number = 5
) {
  assert(
    [0, 5, 10, 20, 30, 40, 50, 60, 2 * 60, 3 * 60].includes(minutes_so_far) ||
      (minutes_so_far > 3 * 60 && Number.isInteger(minutes_so_far / 60)),
    { minutes_so_far }
  );
  const ONE_MINUTE = 60 * 1000;
  setTimeout(() => {
    minutes_so_far = minutes_so_far + minutes_until_next_track_event;
    track_event({
      name: "[session-duration]",
      value: minutes_so_far.toString(),
      nonInteraction: false,
    });
    track_session_duration(
      minutes_so_far,
      (minutes_so_far === 5 && 5) || (minutes_so_far < 60 && 10) || 60
    );
  }, minutes_until_next_track_event * ONE_MINUTE);
}

function track_last_24_hours_visits() {
  const last_24_hours_visits = get_last_24_hours_visits();

  last_24_hours_visits.push(new Date());
  store.set_val(LAST_24_HOURS_VISITS(), last_24_hours_visits, {
    is_passive: true,
  });

  track_event({
    name: "number_of_visits",
    value: prettify_number_of_visits(last_24_hours_visits.length),
  });
}
function get_number_of_visits_in_the_last_24_hours(): number {
  const last_24_hours_visits = get_last_24_hours_visits();
  return last_24_hours_visits.length;
}
function get_last_24_hours_visits(): Date[] {
  let last_24_hours_visits = store.get_val(LAST_24_HOURS_VISITS()) || [];
  assert(
    last_24_hours_visits.constructor === Array &&
      last_24_hours_visits.every((v: Date) => v && v.constructor === Date),
    { last_24_hours_visits }
  );

  {
    const in_24_hours_ago = new Date().getTime() - 24 * 60 * 60 * 1000;
    last_24_hours_visits = last_24_hours_visits.filter(
      (visit: Date) => visit.getTime() > in_24_hours_ago
    );
  }

  return last_24_hours_visits;
}
function LAST_24_HOURS_VISITS() {
  // `"user_visits"` is a legacy name
  return "user_visits";
}

function get_time_string(): string {
  try {
    const d = DateTime.utc();
    const TIME_FORMAT = "HH:mm:ss";
    const time_string = d.toFormat(DATE_FORMAT + "_" + TIME_FORMAT);
    return time_string;
  } catch (err) {
    return "BUG_NO_INTL_SUPPORT";
  }
}

function get_date_string(): string {
  try {
    const d = DateTime.utc();
    const date_string = d.toFormat(DATE_FORMAT);
    return date_string;
  } catch (err) {
    return null;
  }
}

var already_loaded: boolean;
function load_google_analytics() {
  if (already_loaded) return;
  already_loaded = true;
  load_script("//www.google-analytics.com/analytics.js");
  DEBUG && console.log("[GA] ga code loaded");
}
