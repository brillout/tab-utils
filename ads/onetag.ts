import { loadScript } from "../loadScript";

export { loadOneTagScript };

async function loadOneTagScript() {
  await loadScript(
    "https://get.s-onetag.com/06e34b93-922e-48bb-92b3-23af73f987b6/tag.min.js",
    "onetag"
  );
}
