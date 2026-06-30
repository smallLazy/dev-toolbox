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
  background: #1E1E1E;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #1E1E1E;
  padding: 32px 40px;
}
</style>
