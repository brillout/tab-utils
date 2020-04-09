export {rename_keys_and_values};

function rename_keys_and_values({key_replacements, value_replacements}) {
  const db = {};

  let has_changes = false;

  Object
  .entries(localStorage)
  .forEach(([key, val]) => {
    if( key_replacements && (key in key_replacements) ){
      key = key_replacements[key];
      has_changes = true;
    }

    if( value_replacements && (key in value_replacements) && (val in value_replacements[key]) ) {
      val = value_replacements[key][val];
      has_changes = true;
    }

    db[key] = val
  });

  if( !has_changes ){
    return;
  }

  localStorage.clear();

  Object
  .keys(db)
  .forEach(key => {
    localStorage[key] = db[key];
  });
}