import assert from "@brillout/assert";

const DEPLOY_ID = "__DEPLOY";

export { get_deploy_id };

function get_deploy_id() {
  // In order to ensure source mapping, we ensure that the placeholder
  // string got replaced with a same-sized ID string.
  assert(DEPLOY_ID.length === 8);

  return DEPLOY_ID;
}
