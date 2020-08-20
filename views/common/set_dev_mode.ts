export { set_dev_mode };

declare global {
  const process: any;
}

function set_dev_mode(): void {
  if (
    typeof process !== "undefined" &&
    process?.env?.NODE_ENV === "production"
  ) {
    return;
  }
  if (window.location.hostname !== "localhost") {
    return;
  }
  document.documentElement.classList.add("is-dev");
}
