import React from 'react';
import {TabAppRoadmap} from '../../../tab_app_info';

export default RoadmapView;

function RoadmapView() {
  return <>
    <ul>
      <TabAppRoadmap />
    </ul>
    <p>
      You have wish? <a href="/feature-suggestion">Suggest a feature</a>!
    </p>
  </>;
}
