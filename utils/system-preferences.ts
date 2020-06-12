export { is_dark_mode };

function is_dark_mode() {
  // Source: https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript

  const match =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (match && match.matches) {
    return true;
  }
  return false;
}
