import Cookies from "js-cookie";

const EZOIC_COOKIE_NAME = "disable_ezoic_ads";

export { disable_ezoic };
export { enable_ezoic };

function disable_ezoic() {
  const TEN_YEARS = 365 * 10;
  Cookies.set(EZOIC_COOKIE_NAME, "yes", { expires: TEN_YEARS });
}
function enable_ezoic() {
  Cookies.remove(EZOIC_COOKIE_NAME);
}
