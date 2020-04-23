import React from "react";
import { getPageConfig } from "../PageWrapper";
import { store } from "../../store";

export default getPageConfig(
  () => (
    <>
      <p>
        You can copy your data, then restore your data at <a href="/restore">/restore</a>.
      </p>
      <p>
        <button id="copy-to-clipboard">Copy to Clipboard</button>
        <span id="result" style={{ margin: 0, display: 'inline-block', paddingLeft: 14 }} />
      </p>
      <CodeBlock id="data-dump">
      </CodeBlock>
    </>
  ),
  "Data",
  { onPageLoad }
);

function onPageLoad() {
  const data_dump_el = document.querySelector("#data-dump");
  const copy_to_clipboard = document.querySelector("#copy-to-clipboard");
  const result = document.querySelector("#result");

  const data_dump = store.backup__dump({ readable: true });

  data_dump_el.textContent = data_dump;

  copy_to_clipboard.onclick = () => {
    copyToClipboard(data_dump);
    result.innerHTML = "Success!";
  };

  return;
}

function CodeBlock(props) {
  return (
    <pre
      style={{ margin: 0, wordWrap: "break-word", whiteSpace: "pre-wrap" }}
      {...props}
    />
  );
}

function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
