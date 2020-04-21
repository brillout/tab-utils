export default remove_hash;

function remove_hash() {
  // `window.location.hash = '';` doesn't remove leading `#` sign.
  // See https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r
  window.history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search
  );
}
