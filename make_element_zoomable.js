import assert from "@brillout/assert";
import { track_event } from "./views/common/tracker";
import "./make_element_zoomable.css";
import { scrollToHideScrollElement } from "./pretty_scroll_area";

export { make_element_zoomable };
export let is_zoomed = null;
export { on_zoom_end };

/*
const DEBUG = true;
/*/
const DEBUG = false;
//*/

// zoomEl: target that is being zoomed into
// scaleEl: element on which CSS Transform is applied
// containerEl: container that the zoomed element fully fills
// toggleEl: click element that toggles zoom state
function make_element_zoomable({ containerEl, scaleEl, zoomEl, toggleEl }) {
  assert(containerEl && scaleEl && zoomEl);
  toggleEl = toggleEl || zoomEl;

  DEBUG && console.log("[zoom] setup", { zoomEl, scaleEl, containerEl });
  if (DEBUG && window.location.hostname === "localhost") {
    // Show cursor position
    document.onmousemove = function (e) {
      var x = e.pageX;
      var y = e.pageY;
      e.target.title = "X is " + x + " and Y is " + y;
    };
  }

  scaleEl.classList.add("zooming__scaler");
  containerEl.classList.add("zooming__overflow-container");
  zoomEl.classList.add("zooming__zoomable-element");

  scaleEl.addEventListener(
    "transitionstart",
    (ev) => {
      ev.propertyName === "transform" && on_transition_start();
    },
    { passive: true }
  );
  scaleEl.addEventListener(
    "transitionend",
    (ev) => {
      ev.propertyName === "transform" && on_transition_end();
    },
    { passive: true }
  );

  toggleEl.addEventListener("click", on_click, { passive: true });
  window.addEventListener("resize", on_resize, { passive: true });

  assert(is_zoomed === null, "multiple zoomable elements are not supported.");
  is_zoomed = false;

  return;

  function set_zoom() {
    if (is_zoomed === true) {
      zoomIn({ zoomEl, scaleEl, containerEl });
    } else {
      zoomOut({ scaleEl, containerEl });
    }
  }

  function on_click(ev) {
    on_transition_start();

    is_zoomed = !is_zoomed;

    track_event({ name: is_zoomed ? "zoom_in" : "zoom_out" });

    if (is_zoomed) {
      scrollToHideScrollElement();
    }

    set_zoom();
  }

  var last_size;
  function on_resize() {
    last_size = last_size || { x: null, y: null };
    const size = { x: window.innerWidth, y: window.innerHeight };
    if (last_size.x === size.x && last_size.y === size.y) {
      return;
    }
    last_size = size;
    set_zoom();
  }

  function on_transition_start() {
    containerEl.classList.add("zoom-transition");
  }
  function on_transition_end() {
    containerEl.classList.remove("zoom-transition");
    call_zoom_state_listeners();
  }
}

const on_zoom_end_listeners = [];
function on_zoom_end(listener) {
  on_zoom_end_listeners.push(listener);
}
let last_state;
function call_zoom_state_listeners() {
  if (last_state === is_zoomed) return;
  last_state = is_zoomed;
  if (is_zoomed) {
    on_zoom_end_listeners.forEach((listener) => {
      listener();
    });
  }
}

function zoomIn({ zoomEl, scaleEl, containerEl }) {
  const { height: zoom_el_height, width: zoom_el_width } = getElementSizes(
    zoomEl
  );
  const { height: container_height, width: container_width } = getElementSizes(
    containerEl
  );
  const log_data = {
    zoom_el_width,
    zoom_el_height,
    zoomEl,
    container_width,
    container_height,
    containerEl,
  };
  assert(
    zoom_el_height && zoom_el_width && container_height && container_width,
    "[zoom-problem]",
    log_data
  );
  DEBUG && console.log("[zoom]", log_data);

  const scale_el_pos__absolute = getPosition(scaleEl);
  const zoom_el_pos__absolute = getPosition(zoomEl);
  const zoom_el_pos__relative = {
    x: zoom_el_pos__absolute.x - scale_el_pos__absolute.x,
    y: zoom_el_pos__absolute.y - scale_el_pos__absolute.y,
  };
  const zoom_el_pos = zoom_el_pos__relative;
  DEBUG &&
    console.log(
      "[zoom]",
      JSON.stringify({
        zoom_el_pos__relative,
        zoom_el_pos__absolute,
        scale_el_pos__absolute,
      })
    );

  const scale = Math.min(
    container_height / zoom_el_height,
    container_width / zoom_el_width
  );
  DEBUG && console.log("[zoom]", JSON.stringify({ scale }));

  const screen_center = [container_width / 2, container_height / 2];
  const zoom_el_center = [
    zoom_el_width / 2 + zoom_el_pos.x,
    zoom_el_height / 2 + zoom_el_pos.y,
  ];
  const translation = [
    screen_center[0] - zoom_el_center[0],
    screen_center[1] - zoom_el_center[1],
  ];
  DEBUG &&
    console.log(
      "[zoom]",
      JSON.stringify({ screen_center, zoom_el_center, translation })
    );

  scaleEl.style.setProperty("--scale", scale);
  scaleEl.style.setProperty("--zoom-center-x", zoom_el_center[0] + "px");
  scaleEl.style.setProperty("--zoom-center-y", zoom_el_center[1] + "px");
  scaleEl.style.setProperty("--translate-x", translation[0] + "px");
  scaleEl.style.setProperty("--translate-y", translation[1] + "px");
  document.documentElement.classList.add("zoomed-state");
  /* Playground: http://jsfiddle.net/2sqprjot/ */
}

function zoomOut({ scaleEl, containerEl }) {
  document.documentElement.classList.remove("zoomed-state");
}

// Old code
//  - Shortcut keybinding
//  - #fullscreen URL hash

/*
  var fullscreen_toggle;
  var hashListener;
  //{{{
  (function()
  {
    var FULLSCREEN_HASH = 'fullscreen';

    function isFullscreen(){return location.hash==='#'+FULLSCREEN_HASH}
    el.unfullscreen=function(){if(isFullscreen()) location.hash=''};

    fullscreen_toggle=function()
    //{{{
    {
      location.hash=isFullscreen()?'':FULLSCREEN_HASH;
    //dom_fullscreen_toggle();
    };
    //}}}

    (function(){
      var isFs;
      var last_isFs;
      hashListener=function(){
        ml.reqFrame(function(){
          if(!last_isFs || last_isFs!=isFs) {
          //dom_fullscreen_toggle();
            last_isFs=isFs;
          }
          if(isFullscreen()) {
            fsFcts[0]();
            isFs=true;
          }
          else {
            //if(location.hash) location.hash='#';
            fsFcts[1]();
            isFs=false;
          }
        });
      }
    })();
  })();
  //}}}

  el.addEventListener('click',fullscreen_toggle,false);
  if(keybinding) window.addEventListener('keydown',function(ev)
  //{{{
  {
    ev = ev || window.event;
    if(ml.controlKeyPressed(ev)) return;
    var targetType = ml.getEventSource(ev).type;
    if(targetType==='text' || targetType==='url') return;
    if(ml.getChar(ev)===keybinding) fullscreen_toggle();
  },false);
  //}}}

  hashListener();
  ml.addHashListener(hashListener);
  window.addEventListener('resize',function() { setTimeout(hashListener,1); },false);
  return hashListener;
  */

function getSize(el, styleProp) {
  const computed_style = get_computed_style(el, styleProp);
  return parseInt(computed_style, 10) || 0;
}

function get_computed_style(el, styleProp) {
  return document.defaultView
    .getComputedStyle(el, null)
    .getPropertyValue(styleProp);
}

function getElementSizes(el) {
  let height = getSize(el, "height");
  let width = getSize(el, "width");

  const box_sizing = get_computed_style(el, "box-sizing");
  if (box_sizing !== "border-box") {
    height += getOuterSize(["top", "bottom"]);
    width += getOuterSize(["left", "right"]);
  }

  return { height, width };

  function getOuterSize(d) {
    return d
      .map(function (di) {
        const paddingSize = getSize(el, "padding-" + di);
        const borderSize = getSize(el, "border-" + di);
        return paddingSize + borderSize;
      })
      .reduce(function (i1, i2) {
        return i1 + i2;
      });
  }
}

function getPosition(el) {
  let left = 0;
  let top = 0;
  let current_el = el;
  do {
    left += current_el.offsetLeft;
    top += current_el.offsetTop;
  } while ((current_el = current_el.offsetParent));
  return { x: left, y: top };
}
