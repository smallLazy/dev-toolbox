<script setup lang="ts">
import MainLayout from "./layouts/MainLayout.vue";
import { useWorkspaceStore } from "./stores/workspace";
import { onMounted, onUnmounted } from "vue";

const workspaceStore = useWorkspaceStore();

onMounted(async () => {
  workspaceStore.init();
});

// ── Global Keyboard Shortcuts ─────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  // ⌘K / Ctrl+K → toggle Command Palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    // Command palette open/close is handled via workspace store + composable
    // The palette component listens for this event
    window.dispatchEvent(new CustomEvent('workspace:open-palette'))
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <MainLayout />
</template>
