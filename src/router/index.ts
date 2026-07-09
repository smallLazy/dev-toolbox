import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../modules/home/DashboardView.vue"),
    },
    {
      path: "/crypto",
      name: "crypto",
      component: () => import("../features/crypto/CryptoView.vue"),
    },
    {
      path: "/cloud-encrypt",
      redirect: "/preset/php-compatible",
    },
    {
      path: "/preset/php-compatible",
      name: "preset-php-compatible",
      component: () => import("@/presets/PresetView.vue"),
      meta: { preset: "php-compatible" },
    },
    {
      path: "/json",
      name: "json",
      component: () => import("../features/json/JsonView.vue"),
    },
    {
      path: "/sql",
      name: "sql",
      component: () => import("../features/sql/SqlView.vue"),
    },
    {
      path: "/sql-in",
      redirect: { path: "/sql", query: { mode: "in-builder" } },
    },
    {
      path: "/diff",
      name: "diff",
      component: () => import("../features/diff/DiffView.vue"),
    },
    {
      path: "/base64",
      name: "base64",
      component: () => import("../features/base64/Base64View.vue"),
    },
    {
      path: "/html-encode",
      name: "html-encode",
      component: () => import("../features/html-encode/HtmlEncodeView.vue"),
    },
    {
      path: "/url",
      name: "url",
      component: () => import("../features/url/UrlView.vue"),
    },
    {
      path: "/unicode",
      name: "unicode",
      component: () => import("../features/unicode/UnicodeView.vue"),
    },
    {
      path: "/timestamp",
      name: "timestamp",
      component: () => import("../features/timestamp/TimestampView.vue"),
    },
    {
      path: "/hash",
      name: "hash",
      component: () => import("../features/hash/HashView.vue"),
    },
    {
      path: "/jwt",
      name: "jwt",
      component: () => import("../features/jwt/JwtView.vue"),
    },
    {
      path: "/qrcode",
      name: "qrcode",
      component: () => import("../features/qrcode/QrcodeView.vue"),
    },
    {
      path: "/uuid",
      name: "uuid",
      component: () => import("../features/uuid/UuidView.vue"),
    },
    {
      path: "/xml",
      name: "xml",
      component: () => import("../features/xml/XmlView.vue"),
    },
    {
      path: "/config",
      redirect: "/settings",
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../modules/config/SettingsView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../modules/about/AboutView.vue"),
    },
    // Catch-all: tools registered in sidebar but not yet implemented
    // render the ToolUnavailable fallback instead of a blank page.
    {
      path: "/:pathMatch(.*)*",
      name: "tool-unavailable",
      component: () => import("../components/ToolUnavailable.vue"),
    },
  ],
});

export default router;
