// TODO remove this - should live in source

import pretty_scroll_area, {scrollToElement} from './pretty_scroll_area';

export default more_panel;

function more_panel() {
  actionize_more_panel_link();
  pretty_scroll_area();
}

function actionize_more_panel_link() {
  const link_source = document.querySelector('#more_panel_jumper');
  if( !link_source ) return;
  link_source.onclick = ev => {
    scrollToElement('#more_panel');
    ev.preventDefault();
    return false;
  };
}
