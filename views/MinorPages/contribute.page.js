import React from 'react';
import {getPageConfig} from '../PageWrapper';
import {tab_app_name, tab_app_source_code} from '../../../tab_app_info';

export default getPageConfig(
  () => <>
    <p>
    The best way to contribute is to <a href="/donate">donate</a>.
    </p>

    <p>
    If you know how to program, you can participate in {tab_app_name}'s development, see
    {" "}
    <a href={tab_app_source_code} target="_blank">{tab_app_name}'s GitHub</a>.
    </p>
  </>,
  'Contribute',
);
