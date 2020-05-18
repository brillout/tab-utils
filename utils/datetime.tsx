import { DateTime } from "luxon";

export { get_current_time };

// List of tokens: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens

function get_current_time({ military_format = false }): string {
  const d = DateTime.local();
  const format = military_format ? "HH:mm" : "h:mm a";
  const time_string = d.toFormat(format);
  return time_string;
}
