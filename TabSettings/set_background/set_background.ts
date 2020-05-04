import "./set_background.css";

export { set_background };

//tricky bg images to test:
//-http://static.panoramio.com/photos/original/3719338.jpg
//-cover test: http://cdn.techpp.com/wp-content/uploads/2008/10/gmail_logo.jpg
//black floor: http://img.wallpaperstock.net:81/black-floor-wallpapers_6854_1680x1050.jpg
//http://lh6.googleusercontent.com/-AAQe-KJXX-w/TcRrpukjk6I/AAAAAAAACwE/-7gmjOI-ctQ/IMG_2649mod.jpg
//http://www.a-better-tomorrow.com/blog/wp-content/wallpaper_abt1.jpg
//http://www.gowallpaper.net/wp-content/uploads/2011/04/Windows-7-3d-wide-wallpaper-1280x800.jpg
//http://vistawallpapers.files.wordpress.com/2007/03/vista-wallpapers-69.jpg

let BG_EL: HTMLElement;

//to test: resize image to screen.width and screen.height using canvas and webworkers
//window.screen.width;
//window.screen.height;

async function set_background(color_code?: string, image_uri?: string) {
  const is_outdated = get_is_outdated();

  init();

  await set_image(image_uri, is_outdated);

  if (is_outdated()) {
    return;
  }

  apply_color(color_code);
}

function apply_color(color_code: string) {
  color_code = color_code || "transparent";
  BG_EL.style.backgroundColor = color_code;
}

function apply_image(image_val: string) {
  BG_EL.classList.remove("loader-bg");
  image_val = image_val || "none";
  BG_EL.style.backgroundImage = image_val;
  BG_EL.style["backgroundSize"] = "cover";
}

async function set_image(image_uri: string, is_outdated: () => {}) {
  const is_data_uri =
    image_uri.indexOf(".") !== -1 || /^data:image/.test(image_uri);
  if (is_data_uri) {
    apply_image(image_uri);
    return false;
  }

  const imgEl = document.createElement("img");

  let loaded = false;

  let resolve: () => void;
  const promise = new Promise(
    (r) =>
      (resolve = () => {
        r();
      })
  );

  imgEl.onload = function () {
    resolve();

    loaded = true;

    // @ts-ignore
    const w = this.width;
    // @ts-ignore
    const h = this.height;

    if (is_outdated()) {
      return;
    }

    if (w * h > 8000000) {
      alert(
        "The provided image has a size of " +
          w +
          "*" +
          h +
          " pixels. Large images are likely to slow down your machine. Thus only images of up to 8 000 000 pixels are allowed. (For example, any image bellow 5000*1600 is fine.)"
      );
      apply_image(null);
    } else {
      apply_image('url("' + image_uri + '")');
    }
  };

  imgEl.onerror = function () {
    resolve();

    if (is_outdated()) {
      return;
    }

    alert(
      "Image " +
        image_uri +
        " could not be loaded. Is the image online? Do you have an internet connection? Does the URL point to an image? (Note that the URL should point to the image itself and not to a page containing the image.)"
    );

    apply_image(null);
  };

  window.setTimeout(function () {
    if (is_outdated()) {
      return;
    }

    if (loaded) {
      return;
    }

    BG_EL.classList.add("loader-bg");
  }, 50);

  imgEl.src = image_uri;

  return promise;
}

function init() {
  if (BG_EL) return;
  BG_EL = document.body;

  //following 2 styles used for auto sized background for loading gif
  BG_EL.style["backgroundRepeat"] = "no-repeat";
  BG_EL.style["backgroundPosition"] = "center";
  //fixed because no way found to set BG_EL's size to scroll size of window
  //-http://stackoverflow.com/questions/7540418/css-setting-an-elements-size-to-the-scroll-size-of-the-page
  BG_EL.style["backgroundAttachment"] = "fixed";
  //make sure size is at least size of window
  BG_EL.style["min-height"] = "100%";
  BG_EL.style["min-width"] = "100%";

  //// not needed when backgroundAttachment == fixed
  //BG_EL.style['minHeight']            = '100%';
  //BG_EL.style['minWidth ']            = '100%';
}

let call_number = 0;
function get_is_outdated() {
  ++call_number;

  const current = call_number;

  return () => current === call_number;
}
