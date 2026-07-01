import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * Application-level configuration store.
 *
 * Per-tool settings are managed within each Feature via the Plugin SDK
 * settings system. This store is kept as a lightweight framework for
 * any future app-global preferences.
 */

export const useAppStore = defineStore("app", () => {
  const config = ref<Record<string, unknown>>({});

  async function loadConfig() {
    try {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load("config.json", { autoSave: true, defaults: {} });
      const saved = await store.get<Record<string, unknown>>("toolConfig");
      if (saved) {
        config.value = { ...saved };
      }
    } catch {
      console.log("Config store not available, using defaults");
    }
  }

  async function saveConfig() {
    try {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load("config.json", { autoSave: true, defaults: {} });
      await store.set("toolConfig", config.value);
      await store.save();
    } catch {
      console.log("Config store not available, cannot save");
    }
  }

  return { config, loadConfig, saveConfig };
});
