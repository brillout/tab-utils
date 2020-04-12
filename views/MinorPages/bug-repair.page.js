import React from 'react';
import {getPageConfig} from '../PageWrapper';
import Bowser from "bowser";
import {tab_app_name, tab_subapp_ids} from '../../../tab_app_info';

export default getPageConfig(
  () => <>
    <p>
    Your {tab_app_name} does not work? Click <a id='repair-link' data-subject="Bug Repair" className="contact-address" target="_blank">here</a>.
    </p>
    <p>
    You will get a response ASAP.
    </p>
    <p>
    Alternatively, you can describe your problem at <a data-subject="Bug" className="contact-address" target="_blank"></a>.
    </p>

    <br/>
    Your browser:
    <CodeBlock id="browser-spec"/>

    <br/>
    Your settings:
    <CodeBlock id="setting-spec"/>

    <br/>
    Other setting keys:
    <CodeBlock id="settings-other"/>
  </>,
  'Bug Repair',
  {onPageLoad},
);

function CodeBlock(props) {
  return (
    <pre style={{margin: 0, wordWrap: 'break-word', whiteSpace: 'pre-wrap'}} {...props}/>
  );
}

function onPageLoad() {
  const link = document.querySelector('#repair-link');

  const browser_spec = getBrowser();
  const {settings__string, external_settings} = getSettings();

  link.setAttribute('data-body', [
    "Hi Romuald, my "+tab_app_name+" doesn't work.",
    '',
    'My Browser:',
    browser_spec,
    '',
    'My Settings:',
    settings__string,
    '',
    'Other settings keys:',
    external_settings,
    '',
    'Thanks for having a look!',
  ].join('\n'));

  document.querySelector('#browser-spec').innerHTML = escapeHtml(browser_spec);
  document.querySelector('#setting-spec').innerHTML = escapeHtml(settings__string);
  document.querySelector('#settings-other').innerHTML = escapeHtml(external_settings);
}

function getBrowser() {
  const browser = Bowser.getParser(window.navigator.userAgent);
  return JSON.stringify(browser.getBrowser(), null, 2);
}

function getSettings() {
  const settings__obj = {};
  let external_settings = [];
  Object.entries(window.localStorage).forEach(([key, val]) => {
    if( isTabSetting(key) ) {
      settings__obj[key] = val;
    } else {
      external_settings.push(key);
    }
  });
  const settings__string = JSON.stringify(settings__obj, null, 2);
  external_settings = JSON.stringify(external_settings);
  return {settings__string, external_settings};
}

function escapeHtml(str) {
  return (
    str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
  );
}

function isTabSetting(key) {
  return (
    tab_subapp_ids
    .some(subapp_id => key.startsWith(subapp_id+'_'))
  )
}
