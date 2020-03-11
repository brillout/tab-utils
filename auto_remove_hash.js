import remove_hash from './private/remove_hash';

export default auto_remove_hash;

function auto_remove_hash({IGNORE_LIST, INCLUDE_LIST}) {
  check();
  [100, 300, 600, 900].forEach(timeout => setTimeout(check, timeout));
  window.addEventListener("hashchange", check, {passive: true, capture: false});

  function check() {
    const {hash} = location;
    /* doesn't work because `location.hash===''` even for `localhost:3000/#`
    if( hash==='#' ) {
      remove_hash();
    }
    */
    if( IGNORE_LIST && IGNORE_LIST.includes(hash) ){
      return;
    }
    if( INCLUDE_LIST && !INCLUDE_LIST.includes(hash) ){
      return;
    }
    remove_hash();
  }
}
