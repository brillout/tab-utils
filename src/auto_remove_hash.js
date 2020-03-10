import remove_hash from './private/remove_hash';

export default auto_remove_hash;

function auto_remove_hash() {
  const WHITELIST = [
    '#fullscreen',
  ];

  window.addEventListener("hashchange", () => {
    if( WHITELIST.includes(location.hash) ) {
      return;
    }
    ;
  }, false);

  function removeHash () {
    // `window.location.hash = '';` doesn't remove leading `#` sign.
    // See https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  }

}
