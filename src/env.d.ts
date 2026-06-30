/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __GIT_HASH__: string
declare const __GIT_BRANCH__: string
declare const __BUILD_TIME__: string
declare const __BUILD_MODE__: string
declare const __TAURI_VERSION__: string
declare const __VUE_VERSION__: string
declare const __RUST_VERSION__: string
declare const __BUILD_ARCH__: string

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
