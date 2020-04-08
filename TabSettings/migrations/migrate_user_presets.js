export {migrate_user_presets};

function migrate_user_presets(migrator) {
  ['countdown_presets', 'clock_presets']
  .forEach(presets__storage_key => {
    const presets__string = localStorage[presets__storage_key];
    if( !presets__string ) {
      return;
    }
    const presets = JSON.parse(presets__string);
    let has_changes = false;
    presets.forEach(preset => {
      if( migrator(preset) ){
        has_changes = true;
      }
    });
    if( has_changes ){
      const presets__string__updated = JSON.stringify(presets);
      localStorage[presets__storage_key] = presets__string__updated;
    }
  });
}
