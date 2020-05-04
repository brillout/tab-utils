import "./set_background.css";

type ImageUri = string & { _brand?: "ImageUri" };
type BgImgVal = string & { _brand?: "BgImgVal" };
type ColorVal = string & { _brand?: "ColorVal" };

export { set_background };

//tricky bg images to test:
//-http://static.panoramio.com/photos/original/3719338.jpg
//-cover test: http://cdn.techpp.com/wp-content/uploads/2008/10/gmail_logo.jpg
//black floor: http://img.wallpaperstock.net:81/black-floor-wallpapers_6854_1680x1050.jpg
//http://lh6.googleusercontent.com/-AAQe-KJXX-w/TcRrpukjk6I/AAAAAAAACwE/-7gmjOI-ctQ/IMG_2649mod.jpg
//http://www.a-better-tomorrow.com/blog/wp-content/wallpaper_abt1.jpg
//http://www.gowallpaper.net/wp-content/uploads/2011/04/Windows-7-3d-wide-wallpaper-1280x800.jpg
//http://vistawallpapers.files.wordpress.com/2007/03/vista-wallpapers-69.jpg

//to test: resize image to screen.width and screen.height using canvas and webworkers
//window.screen.width;
//window.screen.height;

async function set_background(color_code: ColorVal, image_uri: ImageUri) {
  const is_outdated = get_is_outdated();

  init();

  const bg_img_val: BgImgVal = await load_image(image_uri, is_outdated);

  if (is_outdated()) {
    return;
  }

  apply(color_code, bg_img_val, false);
}

function apply(
  color_code: ColorVal,
  bg_img_val: BgImgVal,
  show_loader: boolean
) {
  apply_color(color_code);
  apply_image(bg_img_val);
  BG_EL.classList[show_loader ? "add" : "remove"]("loader-bg");
}

async function load_image(
  image_uri: ImageUri,
  is_outdated: () => boolean
): Promise<BgImgVal> {
  if (!image_uri) {
    return null;
  }

  {
    const is_data_uri = /^data:image/.test(image_uri);
    if (is_data_uri) {
      const bg_img_val: BgImgVal = image_uri + "";
      return bg_img_val;
    }
  }

  const imgEl = document.createElement("img");

  let resolve: (_: BgImgVal) => void;
  const promise = new Promise<BgImgVal>((r) => {
    resolve = r;
  });

  let loaded = false;

  imgEl.onload = function () {
    loaded = true;
    const image_val = on_load();
    resolve(image_val);
  };

  imgEl.onerror = function () {
    loaded = true;
    on_error();
    resolve(null);
  };

  set_loader_indicator();

  imgEl.src = image_uri;

  return promise;

  function on_load(): BgImgVal {
    const w = imgEl.width;
    const h = imgEl.height;

    if (w * h > 8000000) {
      if (!is_outdated()) {
        alert(
          "The provided image has a size of " +
            w +
            "*" +
            h +
            " pixels. Large images are likely to slow down your machine. Thus only images of up to 8 000 000 pixels are allowed. (For example, any image bellow 5000*1600 is fine.)"
        );
      }
      return null;
    } else {
      return 'url("' + image_uri + '")';
    }
  }

  function on_error() {
    if (!is_outdated()) {
      alert(
        "Image " +
          image_uri +
          " could not be loaded. Is the image online? Do you have an internet connection? Does the URL point to an image? (Note that the URL should point to the image itself and not to a page containing the image.)"
      );
    }
  }

  function set_loader_indicator() {
    window.setTimeout(function () {
      if (is_outdated()) {
        return;
      }

      if (loaded) {
        return;
      }

      apply(null, null, true);
    }, 50);
  }
}

function apply_color(color_code: ColorVal) {
  color_code = color_code || "transparent";
  BG_EL.style.backgroundColor = color_code;
}

function apply_image(bg_img_val: BgImgVal) {
  bg_img_val = bg_img_val || "none";
  BG_EL.style.backgroundImage = bg_img_val;
  BG_EL.style.backgroundSize = "cover";
}

let BG_EL: HTMLElement;
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

  const is_outdated = () => current !== call_number;
  return is_outdated;
}
