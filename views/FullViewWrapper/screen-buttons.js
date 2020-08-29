import assert from "@brillout/assert";
import { scrollToElement, addScrollListener } from "../../pretty_scroll_area";
import { show_toast } from "../common/show_toast";
import { user_donated } from "../../load_ad";
import { toggle_zoom } from "../../make_element_zoomable";

export { activate_screen_buttons };

function activate_screen_buttons() {
  activate_view_buttons();
  activate_settings_button();
  activate_donate_button();
  activate_thanks_button();
  activate_zoom_button();
}

function activate_zoom_button() {
  const zoom_button = document.querySelector("#zoom-button");
  zoom_button.onclick = () => {
    toggle_zoom();
  };
}

function activate_settings_button() {
  const settings_button = document.querySelector("#settings-button");
  settings_button.onclick = () => {
    scrollToElement("#more_panel");
  };
}

function activate_donate_button() {
  const donate_button = document.querySelector("#donate-button");
  donate_button.onclick = () => {
    window.open("/donate", "_self");
  };
}

function activate_thanks_button() {
  const thanks_button = document.querySelector("#thanks-button");
  thanks_button.onclick = () => {
    window.open("/thanks", "_self");
  };
}

function activate_view_buttons() {
  const scroll_button = document.querySelector("#center-button");
  const fullscreen_button = document.querySelector("#fullscreen-button");
  const full_view = document.querySelector(
    ".pretty_scroll_area__hide_scroll_element"
  );

  scroll_button.onclick = do_scroll;
  fullscreen_button.onclick = do_fullscreen;

  const stop_auto_scroll = activate_auto_scroll({ do_scroll });

  return;

  async function do_scroll() {
    stop_auto_scroll();
    await scrollToElement(full_view);
  }
  async function do_fullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      show_toast("Your browser doesn't support fullscreen.", {
        is_error: true,
        short_duration: true,
      });
      return;
    }
    // When tab goes to fullscreen, scroll is changed; ensure with `requestAnimationFrame` that
    // scrolling happens *after* the tab goes fullscreen.
    requestAnimationFrame(async () => {
      await do_scroll();
    });
  }
}

/*/
let auto_duration = 1000;
/*/
let auto_duration = 4;
//*/
function activate_auto_scroll({ do_scroll }) {
  const scroll_button = document.querySelector("#center-button");
  const scroll_button_text = scroll_button.querySelector(".button-text");
  const active_class = "auto-scroll-is-active";

  addScrollListener(scrollListener, {
    onlyUserScroll: false,
    fireInitialScroll: false,
  });
  start_auto_scroll();

  return stop_auto_scroll;

  var counter;
  var repeater;
  function start_auto_scroll() {
    show();
    if (repeater) return;
    counter = auto_duration;
    auto_duration = 10;
    time_step();
    assert.internal(repeater);
  }
  function stop_auto_scroll() {
    hide();
    if (repeater) {
      window.clearTimeout(repeater);
      repeater = null;
    }
  }

  function set(hide = false) {
    scroll_button.classList[hide ? "remove" : "add"](active_class);
    scroll_button_text.textContent = hide ? "" : " " + (counter | 0) + "s";
  }
  function show() {
    set();
  }
  function hide() {
    set(true);
  }

  function time_step() {
    assert(counter >= 0);

    if (!document.hidden) {
      counter--;
      if ((counter | 0) === counter) {
        updateDom();
        if (counter === 0) {
          do_scroll();
          stop_auto_scroll();
          assert.internal(repeater === null);
          return;
        }
      }
    }
    repeater = window.setTimeout(time_step, 1000);
  }

  function updateDom() {
    if (!counter) {
      hide();
    } else {
      show();
    }
  }

  function scrollListener(scrollPos, { is_user_scroll }) {
    if (is_user_scroll && document.fullscreenElement) {
      document.exitFullscreen();
    }

    if (scrollPos === 0) {
      start_auto_scroll();
    } else {
      stop_auto_scroll();
    }
  }
}
