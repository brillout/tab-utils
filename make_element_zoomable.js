    //if(opts.posChangeListeners) opts.posChangeListeners.forEach(function(l){if(l===doZoomIn) opts.posChangeListeners.splice(opts.posChangeListeners.indexOf(l),1)});

import assert from '@brillout/assert';
import {track_event} from './views/common/tracker';
import './make_element_zoomable.css';

export {make_element_zoomable};

/*
const DEBUG = 1;
/*/
const DEBUG = 0;
//*/

function make_element_zoomable({containerEl, scaleEl, zoomEl}) {
  assert(containerEl && scaleEl && zoomEl);

  DEBUG && console.log('[zoom] setup', {zoomEl, scaleEl, containerEl});

  scaleEl.classList.add('zoom-scale-element');
  containerEl.classList.add('zoom-container');
  zoomEl.classList.add('zoomable-element');

  zoomEl.addEventListener('click', toggle_zoom, {passive: true});
  window.addEventListener('resize', rezoom, {passive: true});

  let should_be_zommed = false;

  return;

  function set_zoom() {
    if( should_be_zommed===true ) {
      zoomIn({zoomEl, scaleEl});
    } else {
      zoomOut({scaleEl});
    }
  }

  function toggle_zoom() {
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



function zoomIn({zoomEl, scaleEl}) {

  var sizes = getElementSizes(zoomEl);
  var elWidth   = sizes.width;
  var elHeight  = sizes.height;
  var elPos     = getPosition(zoomEl);

  // make elPos relative to scaleEl
  elPos.x -= getPosition(scaleEl).x
  elPos.y -= getPosition(scaleEl).y;

  /*
  var winWidth   = parseInt(getStyle(zoom_from,'width' ));
  var winHeight  = parseInt(getStyle(zoom_from,'height'));
  */
  var winWidth  = window.innerWidth;
  var winHeight = window.innerHeight;
  var viewWidth  = elWidth;
  var viewHeight = elHeight;
  DEBUG && console.log('[zoom]', {elWidth, elHeight, zoomEl});

  var scale = Math.min(winHeight/viewHeight,winWidth/viewWidth);
  var offset_to_middle = [winWidth-2*(elPos.x+viewWidth/2),winHeight-2*(elPos.y+viewHeight/2)];
  var scale_offset = scale/2; //divide by 2 because scale crops top overflow

  DEBUG && console.log('[zoom]', {scale_offset, offset_to_middle});
  var translation = scale_offset*offset_to_middle[0]+'px,'+scale_offset*offset_to_middle[1]+'px';
  DEBUG && console.log('[zoom]', {translation, scale});
  scaleEl.style.transform = 'translate('+translation+') scale('+scale+')';
}

function zoomOut({scaleEl}) {
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



function getStyle(el,styleProp) {
  return document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
}

function getElementSizes(el){
  const height = (
    getSize('height') + getOuterSize(['top','bottom'])
  );
  const width = (
    getSize('width') + getOuterSize(['left','right'])
  );

  return {height, width};

  function getSize(prop){return parseInt(getStyle(el,prop),10)||0}

  function getOuterSize(d){
    return (
      d.map(function(di){
        const paddingSize = getSize('padding-'+di);
        const borderSize = getSize('border-'+di);
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
