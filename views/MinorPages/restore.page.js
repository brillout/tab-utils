import React from "react";
import { getPageConfig } from "../PageWrapper";
import { store } from "../../store";

export default getPageConfig(
  () => (
    <>
      <p>
        Paste the data here:
      </p>
      <textarea
        id="settings-data-input"
        style={{ width: "100%", minHeight: "50vh" }}
      />
      <p>
        <button id="apply-data">Apply Data</button>
        <span id="result" style={{ margin: 0, paddingLeft: 14 }} />
      </p>
    </>
  ),
  "Restore",
  { onPageLoad }
);

function onPageLoad() {
  const apply_data = document.querySelector("#apply-data");
  const data_input = document.querySelector("#settings-data-input");
  const result = document.querySelector("#result");

  apply_data.onclick = replace_db;

  return;

  function replace_db() {
    result.innerHTML = "";

    const data_string = data_input.value;

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
