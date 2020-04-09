import assert from '@brillout/assert';
import {rename_keys_and_values} from './rename_keys_and_values';

export {migrate_old_timer_tab_schema};

function migrate_old_timer_tab_schema() {
  rename_keys_and_values({
    key_replacements: {
      bg_url: 'timer_background_image',
      goto_url: 'timer_youtube_alarm',
    },
  });
}