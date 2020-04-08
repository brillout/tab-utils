import React from 'react';
import {tab_app_roadmap} from '../../../tab_app_info';

export default RoadmapView;

function RoadmapView() {
  return <>
    <ul>{tab_app_roadmap}</ul>
    <p>
    You have wish? <a href="/feature-suggestion">Suggest a feature</a>!
    </p>
  </>;
}
