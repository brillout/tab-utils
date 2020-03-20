import remove_hash from './private/remove_hash';

export default auto_remove_hash;

function auto_remove_hash({IGNORE_LIST, INCLUDE_LIST}={}) {
  check();
  [100, 300, 600, 900].forEach(timeout => setTimeout(check, timeout));
  window.addEventListener("hashchange", check, {passive: true, capture: false});

  function check() {
    const {hash} = window.location;

    if( isEmptyHash() ){
      remove_hash();
      return;
    }

    if( !IGNORE_LIST && !INCLUDE_LIST ){
      return;
    }
    if( IGNORE_LIST && IGNORE_LIST.includes(hash) ){
      return;
    }
    if( INCLUDE_LIST && !INCLUDE_LIST.includes(hash) ){
      return;
    }

    remove_hash();
  }
}

function isEmptyHash() {
  // In Chrome `location.hash===''` when URL is `localhost:3000/#`
  if( window.location.hash==='#' ){
    return true;
  }
  // Because the above doesn't seem to be reliable
  if( window.href.endsWith('#') ){
    return true;
  }
  return false;
}
