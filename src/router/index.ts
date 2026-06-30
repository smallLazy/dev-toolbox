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
      path: "/hello",
      name: "hello",
      component: () => import("../features/hello/HelloView.vue"),
    },
    {
      path: "/crypto",
      name: "crypto",
      component: () => import("../modules/crypto/CryptoView.vue"),
    },
    {
      path: "/cloud-encrypt",
      name: "cloud-encrypt",
      component: () => import("../modules/cloud/CloudEncryptView.vue"),
    },
    {
      path: "/json",
      name: "json",
      component: () => import("../features/json/JsonView.vue"),
    },
    {
      path: "/sql-in",
      name: "sql-in",
      component: () => import("../modules/sql/SqlInView.vue"),
    },
    {
      path: "/base64",
      name: "base64",
      component: () => import("../modules/base64/Base64View.vue"),
    },
    {
      path: "/url",
      name: "url",
      component: () => import("../modules/url/UrlView.vue"),
    },
    {
      path: "/timestamp",
      name: "timestamp",
      component: () => import("../modules/timestamp/TimestampView.vue"),
    },
    {
      path: "/hash",
      name: "hash",
      component: () => import("../modules/hash/HashView.vue"),
    },
    {
      path: "/jwt",
      name: "jwt",
      component: () => import("../modules/jwt/JwtView.vue"),
    },
    {
      path: "/config",
      name: "config",
      component: () => import("../modules/config/ConfigView.vue"),
    },
  ],
});

export default router;
