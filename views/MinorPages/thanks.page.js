import React from "react";
import { getPageConfig } from "../PageWrapper";
import { tab_app_name } from "../../../tab_app_info";

export default getPageConfig(
  () => (
    <>
      <p>Your donation means a lot to me.</p>

      {/*
      <p>
        If you have any suggestions, <a href="/suggest">let me know</a>!
      </p>
      */}

      <p>All advertisments are removed.</p>

      <p>
        Warm regards,
        <br />
        Romuald
        {/*
        <br />
        <a target="_blank" className="contact-address"></a>
      */}
      </p>

      <p>
        You will be redirected to {tab_app_name} in <span id="counter">x</span>.
      </p>
    </>
  ),
  "Thank you.",
  { route: "/thanks", onPageLoad }
);

function onPageLoad() {
  disable_ads();
  const counterEl = document.getElementById("counter");
  let counter = 10;
  countdown();
  return;
  function countdown() {
    --counter;
    counterEl.textContent = (counter < 10 ? "0" : "") + counter.toString();
    if (counter === 0) {
      window.location.href = "/";
    }
    setTimeout(countdown, 1000);
  }
}
