import assert from "@brillout/assert";
import { rename_keys_and_values } from "./rename_keys_and_values";

migrate_ancient_schema.schema_version = new Date('2020-03-01');

export { migrate_ancient_schema };

function migrate_ancient_schema() {
  rename_keys_and_values({
    key_replacements: {
      theme: "clock_theme",
      bg_image: "clock_background_image",
      bg_color: "clock_background_color",
      font_shadow: "clock_shadow",
      color_font: "clock_color",
      font_size: "clock_size",
      ["12_hour"]: "clock_twelve_hour_format",
      show_pm: "clock_display_period",
      show_seconds: "clock_display_seconds",
      show_date: "clock_display_date",
      show_week: "clock_display_week",
      show_seconds_title: "clock_tab_display_seconds",
      color_icon: "clock_tab_icon_color",
    },
    value_replacements: {
      clock_theme: {
        "": "_creator",
        random: "_random",
      },
    },
  });
}
