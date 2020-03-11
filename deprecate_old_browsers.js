// CSS variables
//  - Supported by all modern browsers.
//  - Not supported by IE11
import add_css from './private/add_css';

export default deprecate_old_browsers;

function deprecate_old_browsers(args) {
  // Does browser support CSS variables?
  if (window.CSS && CSS.supports('color', 'var(--fake-var)')) {
    return;
  }

  addStyle();
  addHtml(args);
}

function addHtml({email, projectName}) {

  const htmlContent = (
`
<div>
  <p>
    ${projectName} works only with modern browsers.
  </p>

  <p>
    Change or update your internet browser.
  </p>

  <p>
    (Technically speaking: ${projectName} needs CSS variables which your browser doesn't provide.)
  </p>

  Romuald<br/>
  <a href="${email}">${email}</a>
</div>
`
  );

  const overlay = createOverlay('deprecate_old_browsers');
  overlay.innerHTML = htmlContent;
}

function createOverlay(id) {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.position = 'fixed';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.zIndex = '999999';
  overlay.style.overflow = 'hidden';
  document.body.appendChild(overlay);
  return overlay;
}

function addStyle() {
  const css_content = (
`
#deprecate_old_browsers {
  display: flex;
  align-items: center;
  justify-content: center;

  background: #eee;
  color: #333;
}
#deprecate_old_browsers a {
  text-decoration: underline!important;
}
`
  );

  add_css(css_content);
}
