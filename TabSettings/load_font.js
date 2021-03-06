import assert from "@brillout/assert";

export default load_font;

async function load_font(font_name) {
  assert(font_name, { font_name });

  const WebFont = require("webfontloader");

  let resolve;
  const promise = new Promise((r) => (resolve = r));

  attempts = 0;
  do_it();

  await promise;

  return;

  var attempts;
  function do_it() {
    assert(font_name, { font_name });
    WebFont.load({
      ...get_font_spec(font_name),
      fontactive: resolve,
      fontinactive: () => {
        attempts++;
        const min = Math.pow(2, attempts);
        const max = 60;
        const seconds = Math.max(min, max);
        const timeout = seconds * 1000;
        setTimeout(do_it, timeout);
      },
    });
  }
}

function get_font_spec(font_name) {
  const HOSTED = ["AirbnbCereal", "LCD"];
  if (HOSTED.includes(font_name)) {
    return {
      custom: {
        families: [font_name],
        urls: ["/fonts/" + font_name + "/" + font_name + ".css"],
      },
    };
  } else {
    return {
      google: {
        families: [font_name],
      },
    };
  }
}
