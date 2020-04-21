import assert from "@brillout/assert";
import { rename_keys_and_values } from "./rename_keys_and_values";

migrate_old_timer_tab_schema.schema_version = new Date('2020-03-04');

export { migrate_old_timer_tab_schema };

function migrate_old_timer_tab_schema() {
  const has_changes = rename_keys_and_values({
    key_replacements: {
      bg_url: "timer_background_image",
      goto_url: "timer_youtube_alarm",
    },
  });
  if (has_changes) {
    localStorage["timer_theme"] = "_creator";
  }
}
