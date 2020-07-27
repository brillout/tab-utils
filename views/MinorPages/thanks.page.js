import React from "react";
import { getPageConfig } from "../PageWrapper";
import { disable_ads } from "../../load_ad";

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
    </>
  ),
  "Thank you.",
  { route: "/thanks", onPageLoad }
);

function onPageLoad() {
  disable_ads();
}
