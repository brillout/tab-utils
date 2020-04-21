export default add_css;

function add_css(content) {
  const el = document.createElement("style");
  el.appendChild(document.createTextNode(content));
  el.setAttribute("type", "text/css");
  document.getElementsByTagName("head")[0].appendChild(el);
}
