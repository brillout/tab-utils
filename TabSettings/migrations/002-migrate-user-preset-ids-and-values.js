import assert from "@brillout/assert";
import { migrate_user_presets } from "./migrate_user_presets";

migrate_user_preset_ids_and_values.schema_version = new Date("2020-03-02");

export { migrate_user_preset_ids_and_values };

function migrate_user_preset_ids_and_values() {
  migrate_user_presets((preset) => {
    assert(preset.preset_name || preset.preset_id);
    if (preset.preset_name) {
      preset.preset_id = preset.preset_name;
      delete preset.preset_name;
      return true;
    }
    assert(preset.preset_options || preset.preset_values);
    if (preset.preset_options) {
      preset.preset_values = preset.preset_options;
      delete preset.preset_options;
      return true;
    }
  });
}
