export default load_script;

function load_script(url, onload) {
  const scriptEl = document.createElement("script");
  scriptEl.src = url;
  scriptEl.async = true;
  if (onload) scriptEl.onload = onload;
  document.getElementsByTagName("head")[0].appendChild(scriptEl);
  return scriptEl;
}
