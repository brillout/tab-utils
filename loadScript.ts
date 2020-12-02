import { track_event } from "./views/common/tracker";
import assert from "@brillout/assert";

export { loadScript };

const LOAD_TIMEOUT = 5;

type ScriptName = "adsense" | "gpt" | "onetag";

async function loadScript(
  scriptUrl: string,
  scriptName: ScriptName
): Promise<boolean> {
  assert(scriptUrl.startsWith("https://"));

  let alreadyResolved = false;
  let hasTimedOut = false;
  let resolve: (success: boolean) => void;
  const promise = new Promise<boolean>((r) => (resolve = r));

  const scriptEl = document.createElement("script");
  scriptEl.src = scriptUrl;
  scriptEl.async = true;

  scriptEl.onload = () => {
    resolve(true);
    trackLoadState(true, true, hasTimedOut, scriptUrl, scriptName);
    alreadyResolved = true;
  };
  scriptEl.onerror = () => {
    resolve(false);
    trackLoadState(false, true, hasTimedOut, scriptUrl, scriptName);
    alreadyResolved = true;
  };

  document.getElementsByTagName("head")[0].appendChild(scriptEl);

  setTimeout(() => {
    if (alreadyResolved) {
      return;
    }
    resolve(false);
    hasTimedOut = true;
    trackLoadState(false, false, hasTimedOut, scriptUrl, scriptName);
  }, LOAD_TIMEOUT * 1000);

  return promise;
}

function trackLoadState(
  success: boolean,
  resolved: boolean,
  hasTimedOut: boolean,
  scriptUrl: string,
  scriptName: ScriptName
) {
  let loadState: string;
  if (!resolved) {
    assert(!success);
    assert(hasTimedOut);
    loadState = "timeout";
  } else {
    if (success) {
      loadState = "loaded";
    } else {
      loadState = "failed";
    }
    if (hasTimedOut) {
      loadState += " [after-timeout]";
    }
  }
  const name = `[${scriptName}] ${scriptUrl} ${loadState}`;
  track_event({ name });
}
