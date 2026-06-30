import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const host = process.env.TAURI_DEV_HOST;

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"));
const cargoToml = (() => {
  try {
    return readFileSync(resolve(__dirname, "src-tauri", "Cargo.toml"), "utf-8");
  } catch {
    return "";
  }
})();
const gitHash = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
})();
const gitBranch = (() => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
})();
const tauriVersion = (() => {
  const m = cargoToml.match(/tauri\s*=\s*\{[^}]*version\s*=\s*"([^"]+)"/);
  return m ? m[1] : "2";
})();
const vueVersion = pkg.dependencies?.vue?.replace(/[\^~]/, "") ?? "3";
const rustVersion = (() => {
  try {
    const v = execSync("rustc --version", { encoding: "utf-8" }).trim();
    return v.replace("rustc ", "");
  } catch {
    return "unknown";
  }
})();
const buildArch = process.arch ?? "unknown";

export default defineConfig(async () => ({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_HASH__: JSON.stringify(gitHash),
    __GIT_BRANCH__: JSON.stringify(gitBranch),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_MODE__: JSON.stringify(process.env.NODE_ENV === "production" ? "release" : "development"),
    __TAURI_VERSION__: JSON.stringify(tauriVersion),
    __VUE_VERSION__: JSON.stringify(vueVersion),
    __RUST_VERSION__: JSON.stringify(rustVersion),
    __BUILD_ARCH__: JSON.stringify(buildArch),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
