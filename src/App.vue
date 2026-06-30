<script setup lang="ts">
import MainLayout from "./layouts/MainLayout.vue";
import { useAppStore } from "./stores/app";
import { onMounted } from "vue";

const appStore = useAppStore();

onMounted(async () => {
  await appStore.loadConfig();
});
</script>

<template>
  <MainLayout />
</template>
