import React from 'react';
import {getPageConfig} from '../PageWrapper';
import {tab_app_name, tab_app_source_code} from '../../../tab_app_info';

export default getPageConfig(
  () => <>
    To suggest a feature, write an email to
    {' '}
    <a
      data-subject="Feature Suggestion"
      data-body="Hi Romuald, I'd like to suggest following new feature:"
      className="contact-address"
      target="_blank"
    />
    .

    <p>
    You can also
    {' '}
    <a href={tab_app_source_code+'issues/new'} target="_blank">
      create a GitHub ticket
    </a>
    {' '}
    on {tab_app_name}'s repository.
    </p>
  </>,
  'Feature Suggestion',
);
