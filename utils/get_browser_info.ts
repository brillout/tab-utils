import Bowser from "bowser";

export { get_browser_info };

function get_browser_info(): string {
  const spec = get_system_spec();
  const os_version = spec.os.versionName || spec.os.version;
  let browser_info =
    spec.browser.name + " " + spec.browser.version + ", " + spec.os.name;
  if (os_version) {
    browser_info += " " + os_version;
  }
  return browser_info;
}

function get_system_spec() {
  const spec = Bowser.parse(window.navigator.userAgent);
  return spec;
}
