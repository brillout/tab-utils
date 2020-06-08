import React from "react";
import { getPageConfig } from "../PageWrapper";
import { PrivacyPolicy } from "@brillout/website-legals";
import { tab_app_name } from "../../../tab_app_info";

export default getPageConfig(Privacy, "Privacy Policy", {
  noHeader: true,
});

function Privacy() {
  return (
    <PrivacyPolicy
      website_name={tab_app_name}
      email_component={<span className="contact-address" />}
      legal_country={"Germany"}
      has_ads={true}
    />
  );
}
