import React from "react";
import { getPageConfig } from "../PageWrapper";
import { TermsOfService } from "@brillout/website-legals";
import { tab_app_name, tab_app_url } from "../../../tab_app_info";

export default getPageConfig(Terms, "Terms of Service", {
  route: "/terms",
  noHeader: true,
});

function Terms() {
  return (
    <>
      <TermsOfService
        website_name={tab_app_name}
        website_url={tab_app_url}
        email_component={<span className="contact-address" />}
        legal_country={"Germany"}
      />
    </>
  );
}
