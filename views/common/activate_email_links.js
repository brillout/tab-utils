import {tab_app_mail} from '../../../tab_app_info';

export default activate_email_links;

function activate_email_links() {
  Array.from(document.querySelectorAll('a.contact-address'))
  .forEach(link => {
    link.innerHTML = link.innerHTML || tab_app_mail;
    link.setAttribute('target', '_blank');
    link.setAttribute('href', getHref(link));
  });
}

function getHref(link) {
  let href = 'mailto:'+tab_app_mail;
  const data_subject = link.getAttribute('data-subject');
  const data_body = link.getAttribute('data-body');

  if( !data_subject && !data_body ){
    return href;
  }

  href += '?';

  if( data_subject ){
    href += 'subject='+encodeURIComponent(data_subject);
    if( data_body ){
      href += '&';
    }
  }

  if( data_body ){
    href += 'body='+encodeURIComponent(data_body);
  }

  return href;
}
