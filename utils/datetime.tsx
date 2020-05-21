import assert from "@brillout/assert";
import { DateTime } from "luxon";

export { display_time };

// List of tokens: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens

function display_time(
  time: Date | number,
  { military_format = false }
): string {
  let d: DateTime;
  if (time.constructor === Date) {
    d = DateTime.fromJSDate(time);
  } else if (time.constructor === Number) {
    d = DateTime.fromMillis(time);
  } else {
    assert(false, { time });
  }
  const format = military_format ? "HH:mm" : "h:mm a";
  const time_string = d.toFormat(format);
  return time_string;
}
