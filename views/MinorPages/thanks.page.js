import React from "react";
import { getPageConfig } from "../PageWrapper";

export default getPageConfig(
  () => (
    <>
      <p>Your donation means a lot to me.</p>

      <p>
        If you have any suggestions, please <a href="/suggest">let me know</a>!
      </p>

      <p>
        Warm regards,
        <br />
        Romuald
        <br />
        <a target="_blank" className="contact-address"></a>
      </p>
    </>
  ),
  "Thank you.",
  { route: "/thanks" }
);
