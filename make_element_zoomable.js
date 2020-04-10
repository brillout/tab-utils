    //if(opts.posChangeListeners) opts.posChangeListeners.forEach(function(l){if(l===doZoomIn) opts.posChangeListeners.splice(opts.posChangeListeners.indexOf(l),1)});

import assert from '@brillout/assert';
import {track_event} from './views/common/tracker';
import './make_element_zoomable.css';

export {make_element_zoomable};

//*
const DEBUG = true;
/*/
const DEBUG = false;
//*/

function make_element_zoomable({containerEl, scaleEl, zoomEl}) {
  assert(containerEl && scaleEl && zoomEl);

  DEBUG && console.log('[zoom] setup', {zoomEl, scaleEl, containerEl});
  if( DEBUG && window.location.hostname==='localhost' ){
    // Show cursor position
    document.onmousemove = function(e){
      var x = e.pageX;
      var y = e.pageY;
      e.target.title = "X is "+x+" and Y is "+y;
    };
  }

  scaleEl.classList.add('zoom-scale-element');
  containerEl.classList.add('zoom-container');
  zoomEl.classList.add('zoomable-element');

  zoomEl.addEventListener('click', toggle_zoom, {passive: true});
  window.addEventListener('resize', rezoom, {passive: true});

  let should_be_zommed = false;

  return;

  function set_zoom() {
    if( should_be_zommed===true ) {
      zoomIn({zoomEl, scaleEl, containerEl});
    } else {
      zoomOut({scaleEl, containerEl});
    }
  }

  function toggle_zoom() {
    console.log('clickkkkkkkkkkkkk');
    should_be_zommed = !should_be_zommed;

    const eventAction = should_be_zommed ? 'zoom_in' : 'zoom_out';
    track_event({
      eventCategory: 'global_stats',
      eventAction,
    });

    set_zoom();
  }

  function rezoom() {
    set_zoom();
  }

};



function zoomIn({zoomEl, scaleEl, containerEl}) {
  containerEl.classList.add('is-zoomed');

  const {height: zoom_el_height, width: zoom_el_width} = getElementSizes(zoomEl);
  DEBUG && console.log('[zoom]', {zoom_el_width, zoom_el_height, zoomEl});

  let zoom_el_pos = getPosition(zoomEl);
  zoom_el_pos.x -= getPosition(scaleEl).x
  zoom_el_pos.y -= getPosition(scaleEl).y;

  const scale_el_width  = getSize(scaleEl,'width' );
  const scale_el_height = getSize(scaleEl,'height');

  const scale = Math.min(scale_el_height/zoom_el_height,scale_el_width/zoom_el_width);
  DEBUG && console.log('[zoom]', JSON.stringify({scale}));

  const scale_el_center = [scale_el_width / 2, scale_el_height / 2];
  const zoom_el_center = [(zoom_el_width / 2) + zoom_el_pos.x, (zoom_el_height / 2) + zoom_el_pos.y];
  const translation = [scale_el_center[0] - zoom_el_center[0], scale_el_center[1] - zoom_el_center[1]];
  DEBUG && console.log('[zoom]', JSON.stringify({scale_el_center, zoom_el_center, translation}));

  /* to debug translation calcuation:
  scaleEl.style.transform = 'translate('+translation[0]+'px, '+translation[1]+'px) scale(1)';
  /*/
  scaleEl.style.transform = 'translate('+translation[0]*scale+'px, '+translation[1]*scale+'px) scale('+scale+')';
  //*/
}

function zoomOut({scaleEl, containerEl}) {
  //scaleEl.style.transform = 'translate(0, 0) scale(1)';
  containerEl.classList.remove('is-zoomed');
  scaleEl.style.transform = '';
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
  const computed_style = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
  return parseInt(computed_style, 10) || 0;
}

function getElementSizes(el){
  const height = (
    getSize(el, 'height') + getOuterSize(['top','bottom'])
  );
  const width = (
    getSize(el, 'width') + getOuterSize(['left','right'])
  );

  return {height, width};

  function getOuterSize(d){
    return (
      d.map(function(di){
        const paddingSize = getSize(el,'padding-'+di);
        const borderSize = getSize(el, 'border-'+di);
        return paddingSize + borderSize;
      })
      .reduce(function(i1,i2){return i1+i2})
    );
  }
}

function getPosition(el){
  let left = 0;
  let top = 0;
  let current_el = el;
  do
  {
    left += current_el.offsetLeft;
    top += current_el.offsetTop;
  } while (current_el = current_el.offsetParent);
  return {x: left, y: top};
};
