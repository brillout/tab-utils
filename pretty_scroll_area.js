import './private/pretty_scroll_area.css';
import assert from '@brillout/assert';

export default pretty_scroll_area;

export {
  getScroll,
  setScroll,

  scrollToElement,

  scrollToHideScrollElement,
  /*
  isScrolledToHideScrollElement,
  */

  addScrollListener,
  removeScrollListener,
};

/*
const DISABLE = true;
/*/
const DISABLE = false;
//*/

let scroll_el;

const hide_scroll_state = {
  is_on_hide_scroll_element: null,
  enable_scroll_auto_hide: null,
  scrollbar_width_computed: null,
};
function onStateChange() {
  const hide_scroll = (
    hide_scroll_state.is_on_hide_scroll_element &&
    hide_scroll_state.enable_scroll_auto_hide &&
    hide_scroll_state.scrollbar_width_computed
  );
  if( DISABLE ){
    return;
  }
  scroll_el.classList[hide_scroll?'add':'remove']('hide_scroll');
}

let initialized = false;
function pretty_scroll_area() {
  if( initialized ) return;
  initialized = true;

  const s1 = document.querySelectorAll('.pretty_scroll_area');
  const s2 = document.querySelectorAll('.pretty_scroll_area__parent');
  const s3 = document.querySelectorAll('.pretty_scroll_area__hide_scroll_element');
  assert.usage(s1.length===1 && s2.length===1 && s3.length===1);
  scroll_el = s1[0];
  const hide_scroll_element = s3[0];

  compute_scrollbar_width();
  hide_scroll_state.scrollbar_width_computed = true;
  onStateChange();

  addScrollListener(scroll_pos => {
    const hide_scroll_pos = scroll_pos === getElementScroll(hide_scroll_element);
    hide_scroll_state.is_on_hide_scroll_element = hide_scroll_pos;
    onStateChange();
  }, {fireInitialScroll: true});

  setTimeout(() => {
    hide_scroll_state.enable_scroll_auto_hide = true;
    onStateChange();
  }, 2000);
}

const scrollListeners = [];
var isAutoScrolling;
function addScrollListener(scrollListener, {onlyUserScroll=false, fireInitialScroll=false}={}) {
  scrollListener.onlyUserScroll = onlyUserScroll;
  scrollListeners.push(scrollListener);
  add_global_scroll_listener();
  if( fireInitialScroll ){
    const scroll_pos = getScroll();
    scrollListener(scroll_pos);
  }
}
function removeScrollListener(scrollListener) {
  const idx = scrollListeners.indexOf(scrollListener);
  if( idx !== -1 ){
    scrollListeners.splice(idx, 1);
  }
}
let already_listening = false;
function add_global_scroll_listener() {
  if( already_listening ) return;
  pretty_scroll_area();
  already_listening = true;
  const scroll_event_el = (
    scroll_el === document.documentElement ?
      window :
      scroll_el
  );
  scroll_event_el.addEventListener(
    'scroll',
    () => {
      const scroll_pos = getScroll();
      scrollListeners.forEach(scrollListener => {
        if( scrollListener.onlyUserScroll && isAutoScrolling ){
          return;
        }
        scrollListener(scroll_pos);
      });
    },
    {passive: true},
  );
}

function getScroll() {
  return scroll_el.scrollTop;
}
async function setScroll(newTop, {smooth=false}={}) {
  if( !smooth ){
    return jumpTo(newTop);
  } else {
    return slideTo(newTop);
  }
}

function jumpTo(newTop) {
  scroll_el.scrollTop = newTop;
}

async function slideTo(top) {
  /*
  const STEPS = 30;
  const INTERVAL = 10;
  /*/
  const STEPS = 30;
  const INTERVAL = 20;
  //*/

  let resolvePromise;
  const promise = new Promise(resolve => resolvePromise = resolve);

  const currentTop = getScroll();
  const distance = top - currentTop;

  isAutoScrolling = true;
  let counter = 0;
  var timer = setInterval(function () {
    jumpTo(currentTop + distance * smoothStep(counter++ / STEPS));
    if (counter > STEPS) {
      clearInterval(timer);
      window.requestAnimationFrame(() => {
        isAutoScrolling = false;
      });
      resolvePromise();
    }
  }, INTERVAL);

  return promise;

  function smoothStep(n) {
    return n * n * (3 - 2 * n);
  }
}

function scrollToElement(selector_or_element, {smooth=true}={}) {
  const top = getElementScroll(selector_or_element);
  return setScroll(top, {smooth});
}

function getElementScroll(selector_or_element) {
  const element = (
    selector_or_element.constructor === String ?
      document.querySelector(selector_or_element) :
      selector_or_element
  );
  const top = element.getBoundingClientRect().top + getScroll();
  return top;
}

function scrollToHideScrollElement({smooth=true}={}) {
  const s3 = document.querySelectorAll('.pretty_scroll_area__hide_scroll_element');
  assert.usage(s3.length===1);

  const hide_scroll_element = s3[0];

  scrollToElement(hide_scroll_element, {smooth});
}
/*
function isScrolledToHideScrollElement() {
  return !!hide_scroll_state.is_on_hide_scroll_element;
}
*/


function compute_scrollbar_width() {
  const scroll_bar_width = get_scroll_bar_width();
  document.documentElement.style.setProperty('--scroll-bar-width', scroll_bar_width+'px');
}
function get_scroll_bar_width() {
  // Creating invisible container
  const outer = document.createElement('div');
  hide_el(outer);
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  const container = document.body;

  container.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  container.removeChild(outer);

  return scrollbarWidth;

  function hide_el(el) {
    el.style.position='absolute';
    el.style.visibility='hidden';
    el.style.zIndex='-9999';
  }
}

