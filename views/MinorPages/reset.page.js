import React from "react";
import { getPageConfig } from "../PageWrapper";

export default getPageConfig(
  () => (
    <>
      <p>Remove all your settings and set Timer Tab to a pristine state.</p>

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
    disableBtn();
    resetState.innerHTML = checkmark + "Reset done.";
  };

  function disableBtn() {
    resetBtn.setAttribute("disabled", "disabled");
  }
}
