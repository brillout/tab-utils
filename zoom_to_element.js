console.log('111');

export default zoom_to_element;

function zoom_to_element(el,unzoom,opts){ 
  //TODO
  //-listen change to: element size change + window size change
  // -just add resize listener and onDiffChange listener
  //-listen to counter changing position (happens when using arrow keys to change countdown)
  //-fallback in case no transition&transform
  opts=opts||{};
  var TRANSITION_DURATION = 600;

  //set transition + determine right css prefix
  var cssPrefix=(function(){ 
    var prefixes=['-webkit-','-moz-','-ms-','-o-',''];
    //in firefox: document.createElement('div').style['-moz-transition']!==document.createElement('div').style['MozTransition'];
    var omPrefixes=['WebkitT','MozT','msT','OT','t'];//reference: modernizr

    //test if browser support required features
    var rightPre;
    for(var i=0;i<omPrefixes.length;i++)
    {
      var pre=omPrefixes[i];
      if(document.documentElement.style[pre+'ransition']!==undefined && document.documentElement.style[pre+'ransform']!==undefined) {
        document.documentElement.style[pre+'ransition']=opts.noTransition?'none':(prefixes[i]+'transform '+(TRANSITION_DURATION/1000)+'s ease-in-out');
        if(document.documentElement.style[pre+'ransition']) rightPre=pre;
      }
    }
    return rightPre;
  })(); 
  if(!cssPrefix) return false;

  function zoomIn(){ 
    function doZoomIn(){
      var data=(function(){ 
        var ret={};
        function boxSize(elem){ 
          function getI(prop){return parseInt(ml.element.getStyle(elem,prop),10)||0}
          var h=getI('height');
          var w=getI('width');
          //gecko's computed values ignores box-sizing:border-box
          var isBorderBox = !ml.browser().usesGecko && ['-webkit-','-moz-','-ms-','-o',''].reduce(function(p1,p2){return ml.element.getStyle(elem,p1+'box-sizing')||ml.element.getStyle(elem,p2+'box-sizing')})==='border-box';
          function getTotal(d){return d.map(function(di){
            return (isBorderBox?0:(getI('padding-'+di)+getI('border-'+di)))+getI('margin-'+di)
          }).reduce(function(i1,i2){return i1+i2}) }
          h+=getTotal(['top','bottom']);
          w+=getTotal(['left','right']);
          return {height:h,width:w};
        } 

        var sizes = boxSize(el);
        var elWidth   = sizes.width;
        var elHeight  = sizes.height;
        var botPad    = !opts.bottomElements?0:opts.bottomElements.map(function(elem){return boxSize(elem).height}).reduce(function(i1,i2){return i1+i2});
        var elPos     = getPosition(el);
        console.log('p',elPos);

        //crop top padding
        var elPadTop  = parseInt(ml.element.getStyle(el,'padding-top'),10);
        elPos.y += elPadTop;
        elHeight-= elPadTop;

        //When zooming: innerHeight/parseInt(ml.element.getStyle(document.documentElement,'height')) === document.documentElement.style.zoom
        //var winWidth   = window.innerWidth;
        //var winHeight  = window.innerHeight;
        var winWidth   = parseInt(ml.element.getStyle(document.documentElement,'width' ));
        var winHeight  = parseInt(ml.element.getStyle(document.documentElement,'height'));
        var viewWidth  = elWidth;
        var viewHeight = elHeight+botPad;

        var ret={};
        ret.scale = Math.min(winHeight/viewHeight,winWidth/viewWidth,opts.maxScale||Infinity);
        ret.offset_to_middle = [winWidth-2*(elPos.x+viewWidth/2),winHeight-2*(elPos.y+viewHeight/2)];
        ret.scale_offset = ret.scale/2; //divide by 2 because scale crops top overflow

        return ret;
      })(); 
      document.documentElement.style[cssPrefix+'ransform']='translate('+data.scale_offset*data.offset_to_middle[0]+'px,'+data.scale_offset*data.offset_to_middle[1]+'px) scale('+data.scale+')';
    }

    if(el.fullscreenZoomed) {ml.assert(false);return;}
    el.fullscreenZoomed={};
    el.fullscreenZoomed.overflow_orginial=document.documentElement.style['overflow'];
    el.fullscreenZoomed.zoomFct=doZoomIn;
    window.addEventListener('resize',el.fullscreenZoomed.zoomFct);
    if(opts.posChangeListeners) opts.posChangeListeners.push(el.fullscreenZoomed.zoomFct);
    document.documentElement.style['overflow']='hidden';

    doZoomIn();
  } 
  function zoomOut(){ 
    if(!el.fullscreenZoomed) {ml.assert(false);return;}
    window.removeEventListener('resize',el.fullscreenZoomed.zoomFct);
    if(opts.posChangeListeners) opts.posChangeListeners.forEach(function(l){if(l===el.fullscreenZoomed.zoomFct) opts.posChangeListeners.splice(opts.posChangeListeners.indexOf(l),1)});
    var overflow_orginial = el.fullscreenZoomed.overflow_orginial;
    delete el.fullscreenZoomed;

    document.documentElement.style[cssPrefix+'ransform']='';
    //timeout makes transition of zoom counter smoother
    setTimeout(function(){document.documentElement.style['overflow']=overflow_orginial},TRANSITION_DURATION+100);
  } 
  unzoom?zoomOut():zoomIn();
}; 



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
