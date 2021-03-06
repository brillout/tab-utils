import assert from "@brillout/assert";
import JSON_S from "@brillout/json-s";

const localStorage_KEY = "tab_storage";

class KeyValueStore {
  has_val(key: string) {
    assert_key(key);
    this.ensure_store();
    return key in this.#store_data;
  }
  get_val(key: string): any {
    assert_key(key);
    this.ensure_store();
    let val = this.#store_data[key];
    val = make_copy(val);
    return val;
  }
  set_val(key: string, val: any, { is_passive = false } = {}) {
    assert_key(key);
    this.ensure_store();
    val = make_copy(val);
    this.#store_data[key] = val;
    this.save_store();
    if (!is_passive) {
      this.#listeners.forEach((listener) => listener(key, val));
    }
  }
  del_val(key: string, { is_passive = false } = {}) {
    if (!this.has_val(key)) return;
    assert_key(key);
    this.ensure_store();
    delete this.#store_data[key];
    this.save_store();
    if (!is_passive) {
      this.#listeners.forEach((listener) => listener(key, "[deleted]"));
    }
  }

  #listeners: Function[] = [];
  add_store_change_listener(listener) {
    this.#listeners.push(listener);
  }

  migrate__rename_keys(key_rename_map: { [key: string]: string }) {
    this.ensure_store();
    for (let key in key_rename_map) {
      if (!(key in this.#store_data)) continue;
      const val = this.#store_data[key];
      delete this.#store_data[key];
      const key__renamed: string = key_rename_map[key];
      this.#store_data[key__renamed] = val;
    }
    this.save_store();
  }

  get_schema_version() {
    this.ensure_store();
    let schema_version: Date =
      this.#store_data["_schema_version"] || new Date("1986");
    assert(schema_version.constructor === Date);
    return schema_version;
  }
  set_schema_version(schema_version: Date) {
    assert(schema_version.constructor === Date);
    this.ensure_store();
    this.#store_data["_schema_version"] = schema_version;
    this.save_store();
  }

  backup__dump({ readable = false } = {}) {
    this.ensure_store();
    let data_string: string = this.get_storage_data_string();

    if (readable) {
      data_string = serialize(deserialize(data_string), { readable: true });
    }

    return data_string;
  }
  backup__restore(data_string: string) {
    console.log(data_string);
    try {
      deserialize(data_string);
    } catch (err) {
      throw err;
    }
    this.set_storage_data_string(data_string);
  }

  #store_data: any = null;

  private set_storage_data_string(data_string: string) {
    window.localStorage.setItem(localStorage_KEY, data_string);
  }
  private get_storage_data_string() {
    const store__data_string = window.localStorage.getItem(localStorage_KEY);
    assert(
      store__data_string === null || store__data_string.constructor === String
    );
    return store__data_string;
  }
  private load_store() {
    const store__data_string = this.get_storage_data_string();

    if (store__data_string === null) {
      this.#store_data = {};
      return;
    }

    let store__data: Object;
    try {
      store__data = deserialize(store__data_string);
    } catch (err) {
      assert(false, "Couldn't parse store data string", err);
      throw err;
    }

    assert(store__data.constructor === Object);
    this.#store_data = store__data;
  }
  private ensure_store() {
    if (this.#store_data === null) {
      this.load_store();
    }
    assert(this.#store_data.constructor === Object);
  }
  private save_store() {
    assert(this.#store_data.constructor === Object);
    const store__data_string = serialize(this.#store_data);
    this.set_storage_data_string(store__data_string);
    this.load_store();
  }
}

function assert_key(key) {
  assert(key.constructor === String, { key });
  assert(!key.startsWith("_"), "key `" + key + "` is reserved");
}

function serialize(obj, { readable = false } = {}) {
  if (readable) {
    return JSON_S.stringify(obj, null, 2);
  } else {
    return JSON_S.stringify(obj);
  }
}
function deserialize(str) {
  return JSON_S.parse(str);
}

// We use `make_copy` to ensure that no outside code gets an object reference.
// That way we ensure that no code outside of this module manipulates the store.
function make_copy<T>(val: T): T {
  const is_ref_val = is_referenced_value(val);
  if (is_ref_val) {
    return deserialize(serialize(val));
  } else {
    return val;
  }
}

function is_referenced_value(val: any): boolean {
  if (val === null || val === undefined) {
    return false;
  } else if ([String, Date, Number, Boolean].includes(val.constructor)) {
    return false;
  } else if (val instanceof Object) {
    return true;
  }
  assert_todo(false);
  return true;
}

function assert_todo(...args: any[]) {
  assert(...args);
}

export const store = new KeyValueStore();
export { serialize };
export { deserialize };
