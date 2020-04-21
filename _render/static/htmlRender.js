const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { tab_app_head_tags } = require("../../../tab_app_head_tags");

module.exports = htmlRender;

async function htmlRender({ page, initialProps, CONTAINER_ID }) {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(page.view, initialProps)
  );

  return {
    head: [...(page.head || []), ...tab_app_head_tags],
    body: ['<div id="' + CONTAINER_ID + '">' + html + "</div>"],
  };
}
