import { migrate_ancient_schema } from "./migrations/001-ancient-schema";
import { migrate_user_preset_ids_and_values } from "./migrations/002-migrate-user-preset-ids-and-values";
import { migrate_subapp_id } from "./migrations/003-migrate-subapp-id";
import { migrate_old_timer_tab_schema } from "./migrations/004-migrate-old-timer-tab-schema";
import { migrate_to_centralized_store } from "./migrations/005-migrate-to-centralized-store";
import { store } from "../store";
import assert from "@brillout/assert";

export { run_migrations };

function run_migrations() {
  if (typeof window === "undefined") {
    return;
  }

  const migrators = [
    migrate_ancient_schema,
    migrate_user_preset_ids_and_values,
    migrate_subapp_id,
    migrate_old_timer_tab_schema,
    migrate_to_centralized_store,
  ];

  const schema_version__curent: Date = store.get_schema_version();
  assert(schema_version__curent.constructor === Date);

  migrators.forEach((migrator, i) => {
    const schema_version: Date = migrator.schema_version;
    assert(schema_version.constructor === Date);
    assert(
      i === migrators.length - 1 ||
        schema_version.getTime() < migrators[i + 1].schema_version.getTime()
    );

    if (schema_version__curent.getTime() < schema_version.getTime()) {
      migrator();
      store.set_schema_version(schema_version);
    }
  });
}
