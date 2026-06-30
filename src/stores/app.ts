import { defineStore } from "pinia";
import { ref } from "vue";

export interface ToolConfig {
  crypto: {
    keyEncoding: "utf8" | "hex" | "base64";
    ivEncoding: "utf8" | "hex" | "base64";
    inputEncoding: "utf8" | "hex" | "base64";
    outputEncoding: "hex" | "base64";
  };
}

const DEFAULT_CONFIG: ToolConfig = {
  crypto: {
    keyEncoding: "utf8",
    ivEncoding: "utf8",
    inputEncoding: "utf8",
    outputEncoding: "base64",
  },
};

export const useAppStore = defineStore("app", () => {
  const activeTool = ref("crypto");
  const config = ref<ToolConfig>({ ...DEFAULT_CONFIG });

  async function loadConfig() {
    try {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load("config.json", { autoSave: true, defaults: {} });
      const saved = await store.get<ToolConfig>("toolConfig");
      if (saved) {
        config.value = { ...DEFAULT_CONFIG, ...saved };
      }
    } catch {
      // Running in browser or store not available — use defaults
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

  function setActiveTool(tool: string) {
    activeTool.value = tool;
  }

  return { activeTool, config, loadConfig, saveConfig, setActiveTool };
});
