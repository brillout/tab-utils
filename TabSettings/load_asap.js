export {load_asap};

let head;

function load_asap(url, onsuccess) {
  head = head || document.getElementsByTagName('head')[0];

  var attempts = 0;
  function do_(){
    //using same script el => onerror doesn't get called again in chrome
    var script= document.createElement('script');
    script.src= url;
    //script.type= 'text/javascript';
    script.onerror = function(){
      head.removeChild(script);
      setTimeout(do_,Math.min(Math.pow(2,attempts)*1000,60000));
    };
    //proxy redirects url -> false onsuccess
    //-no way found to catch this
    if(onsuccess) script.onload  = onsuccess;
    attempts++;
    head.appendChild(script);
  }
  do_();
}
