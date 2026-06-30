import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/crypto",
    },
    {
      path: "/crypto",
      name: "crypto",
      component: () => import("../modules/crypto/CryptoView.vue"),
    },
    {
      path: "/json",
      name: "json",
      component: () => import("../modules/json/JsonView.vue"),
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
