import React from "react";
import { getPageConfig } from "../PageWrapper";
import { store } from "../../store";

export default getPageConfig(
  () => (
    <>
      Paste your bug fix (that Romuald provided you):
      <textarea
        id="settings-data-input"
        style={{ width: "100%", minHeight: "50vh" }}
      />
      <br />
      <button id="apply-fix">Apply Fix</button>
      <br />
      <br />
      Result:
      <pre id="result" style={{ margin: 0 }} />
    </>
  ),
  "Bug Fix",
  { onPageLoad }
);

function onPageLoad() {
  const apply_fix = document.querySelector("#apply-fix");
  const settings_data_input = document.querySelector("#settings-data-input");
  const result = document.querySelector("#result");

  apply_fix.onclick = replace_db;

  return;

  function replace_db() {
    result.innerHTML = "";

    const data_string = settings_data_input.value;

    try {
      store.backup__restore(data_string);
    } catch (err) {
      result.innerHTML = err;
      return;
    }

    window.localStorage.clear();
    store.backup__restore(data_string);

    result.innerHTML = "Success!";
  }
}
