import {migrate_ancient_schema} from './migrations/001-ancient-schema';
import {migrate_user_preset_ids_and_values} from './migrations/002-migrate-user-preset-ids-and-values';
import {migrate_subapp_id} from './migrations/003-migrate-subapp-id';
import {migrate_old_timer_tab_schema} from './migrations/004-migrate-old-timer-tab-schema';

export {run_migrations};

function run_migrations() {
  if( typeof window === "undefined" ){
    return;
  }
  migrate_user_preset_ids_and_values();
  migrate_ancient_schema();
  migrate_subapp_id();
  migrate_old_timer_tab_schema();
}
