import { tab_app_mail } from "../../../tab_app_info";

export default activate_email_links;

function activate_email_links() {
  Array.from(document.querySelectorAll(".contact-address")).forEach((el) => {
    el.innerHTML = el.innerHTML || tab_app_mail;
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("href", getHref(el));
    }
  });
}

function getHref(el) {
  let href = "mailto:" + tab_app_mail;
  const data_subject = el.getAttribute("data-subject");
  const data_body = el.getAttribute("data-body");

  if (!data_subject && !data_body) {
    return href;
  }

  href += "?";

  if (data_subject) {
    href += "subject=" + encodeURIComponent(data_subject);
    if (data_body) {
      href += "&";
    }
  }

  if (data_body) {
    href += "body=" + encodeURIComponent(data_body);
  }

  return href;
}
