import { store } from "../../store";

migrate_to_centralized_store.schema_version = new Date("2020-04-21");

export { migrate_to_centralized_store };

function migrate_to_centralized_store() {
  Object.entries(localStorage).forEach(([key, val]) => {
    if (
      key.startsWith("timer_") ||
      key.startsWith("clock_") ||
      key.startsWith("countdown_") ||
      key === "thanks-for-your-donation"
    ) {
      if (key.endsWith("_presets")) {
        val = JSON.parse(val);
      }
      if (key === "thanks-for-your-donation") {
        val = true;
      }
      store.set_val(key, val);
      window.localStorage.removeItem(key);
    }
  });

  store.migrate__rename_keys({
    "thanks-for-your-donation": "ad_removal",
  });
}
