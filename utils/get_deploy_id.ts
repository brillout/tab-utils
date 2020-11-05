import assert from "@brillout/assert";

const DEPLOY_ID = "__DEPLOY";

export { get_deploy_id };

declare global {
  interface Window {
    deployId: string;
    DEPLOY_ID: string;
  }
}
if (typeof window !== "undefined") {
  window.deployId = window.DEPLOY_ID = DEPLOY_ID;
}

function get_deploy_id() {
  // In order to ensure source mapping, we ensure that the placeholder
  // string got replaced with a same-sized ID string.
  assert(DEPLOY_ID.length === 8);

  return DEPLOY_ID;
}
