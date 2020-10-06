import React from "react";
import { getPageConfig } from "../PageWrapper";
import Cookies from "js-cookie";
import { tab_app_name } from "../../../tab_app_info";

export default getPageConfig(
  () => (
    <>
      <p>Remove your settings; set {tab_app_name} to a pristine state.</p>

      <p>
        <b>WARNING</b> This will remove all your {tab_app_name} settings,
        including all your themes and presets.
      </p>

      <p>
        <button type="button">Factory Reset</button>
      </p>

      <p>
        <span id="state"></span>
      </p>
    </>
  ),
  "Factory Reset",
  { onPageLoad, route: "/reset" }
);

function onPageLoad() {
  const checkmark = "🗸 ";
  const resetBtn = document.querySelector("button");
  const resetState = document.querySelector("#state");

  if (localStorage.length === 0) {
    disableBtn();
    resetState.innerHTML =
      checkmark + "Your Timer Tab is already factory reset.";
  }

  resetBtn.onclick = () => {
    window.localStorage.clear();
    remove_cookies();
    disableBtn();
    resetState.innerHTML = checkmark + "Reset done.";
  };

  function disableBtn() {
    resetBtn.setAttribute("disabled", "disabled");
  }
}

function remove_cookies() {
  // Following two code blocks are most likely redundant

  Object.keys(Cookies.get()).forEach(function (cookieName) {
    Cookies.remove(cookieName);
  });

  // https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript/179514#179514
  {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
}
