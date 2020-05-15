export { sleep };

function sleep({
  seconds,
  milliseconds,
}: {
  seconds?: number;
  milliseconds?: number;
}): Promise<void> {
  milliseconds = milliseconds || seconds * 1000;
  return new Promise((resolve) =>
    window.setTimeout(() => {
      resolve();
    }, milliseconds)
  );
}
