import './private/pretty_scroll_area.css';
import assert from '@brillout/assert';

export default pretty_scroll_area;

export {getScroll, setScroll, scrollToElement};


let scroll_el;

const hide_scroll_state = {
  is_on_top: null,
  enable_scroll_auto_hide: null,
  scrollbar_width_computed: null,
};
function onStateChange() {
  const hide_scroll = (
    hide_scroll_state.is_on_top &&
    hide_scroll_state.enable_scroll_auto_hide &&
    hide_scroll_state.scrollbar_width_computed
  );
  scroll_el.classList[hide_scroll?'add':'remove']('hide_scroll');
}

function pretty_scroll_area() {
  const s1 = document.querySelectorAll('.pretty_scroll_area');
  const s2 = document.querySelectorAll('.pretty_scroll_area__parent');
  assert.usage(s1.length===1 && s2.length===1);
  scroll_el = s1[0];

  compute_scrollbar_width();
  hide_scroll_state.scrollbar_width_computed = true;
  onStateChange();

  add_on_scroll_listener(scroll_pos => {
    hide_scroll_state.is_on_top = scroll_pos === 0;
    onStateChange();
  });

  setTimeout(() => {
    hide_scroll_state.enable_scroll_auto_hide = true;
    onStateChange();
  }, 2000);
}

function add_on_scroll_listener(on_scroll) {
  call();

  const scroll_event_el = (
    scroll_el === document.documentElement ?
      window :
      scroll_el
  );

  scroll_event_el.addEventListener('scroll', call, {passive: true});

  function call() {
    const scroll_pos = getScroll();
    on_scroll(scroll_pos);
  }
}

function getScroll() {
  return scroll_el.scrollTop;
}
function setScroll(newTop, {smooth=false}={}) {
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

  let counter = 0;
  var timer = setInterval(function () {
    jumpTo(currentTop + distance * smoothStep(counter++ / STEPS));
    if (counter > STEPS)
      clearInterval(timer);
      resolvePromise();
  }, INTERVAL);

  return promise;

  function smoothStep(n) {
    return n * n * (3 - 2 * n);
  }
}

function scrollToElement(selector) {
  const el = document.querySelector(selector);
//const top = el.getBoundingClientRect().top;
  const top = el.getBoundingClientRect().top + getScroll();
  setScroll(top, {smooth: true});
//scroll_el.scrollBy({top, behavior: 'smooth'});
//scroll_el.scrollTo({top, behavior: 'smooth'});
//setScroll(top);
}



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

