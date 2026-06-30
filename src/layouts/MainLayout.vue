<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
</script>

<template>
  <div class="main-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--color-neutral-30);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--color-neutral-30);
  padding: var(--content-padding-y) var(--content-padding-x);
}
</style>
