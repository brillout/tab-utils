import assert from "@brillout/assert";
import JSON_S from "@brillout/json-s";

const localStorage_KEY = "tab_storage";

class KeyValueStore {
  has_val(key: string) {
    assert_key(key);
    this.ensure_store();
    return key in this.#store_data;
  }
  get_val(key: string) {
    assert_key(key);
    this.ensure_store();
    return this.#store_data[key];
  }
  set_val(key: string, val: any) {
    assert_key(key);
    this.ensure_store();
    this.#store_data[key] = val;
    this.save_store();
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

  get_storage_data_string() {
    this.ensure_store();
    const store__data = this.#store_data;
    const store__data_pretty_string = JSON.stringify(store__data, null, 2);
    return store__data_pretty_string;
  }

  #store_data: any = null;

  private load_store() {
    const store__data_string = window.localStorage.getItem(localStorage_KEY);
    assert(
      store__data_string === null || store__data_string.constructor === String
    );
    if (store__data_string === null) {
      this.#store_data = {};
      return;
    }
    let store__data;
    try {
      store__data = deserialize(store__data_string);
    } catch (err) {
      assert(false, "Couldn't parse localStorage string", err);
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
    window.localStorage.setItem(localStorage_KEY, store__data_string);
    this.load_store();
  }
}

function assert_key(key) {
  assert(key.constructor === String, { key });
  assert(!key.startsWith("_"), "key `" + key + "` is reserved");
}

function serialize(obj) {
  return JSON_S.stringify(obj);
}
function deserialize(str) {
  return JSON_S.parse(str);
}

export const store = new KeyValueStore();
export { serialize };
export { deserialize };
