export {sleep};

function sleep({seconds, milliseconds}) {
  milliseconds = milliseconds || seconds*1000;
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}
