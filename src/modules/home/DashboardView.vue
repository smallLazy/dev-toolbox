<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { APP_ICONS } from '@/design/icons'
import { useWorkspaceStore } from '@/stores/workspace'
import DashboardWelcome from '@/components/DashboardWelcome.vue'
import DashboardRecent from '@/components/DashboardRecent.vue'
import DashboardFavorites from '@/components/DashboardFavorites.vue'
import DashboardGrid from '@/components/DashboardGrid.vue'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const showWelcome = computed(() =>
  workspaceStore.recentIds.length === 0 && workspaceStore.favoriteIds.length === 0,
)

function openTool(pluginId: string) {
  const tool = workspaceStore.getTool(pluginId)
  if (!tool) return
  workspaceStore.touchRecent(pluginId)
  router.push(tool.path)
}
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <component :is="APP_ICONS.toolbox" class="branding-icon" :size="32" />
      <div class="page-header-text">
        <h1>Dev Toolbox</h1>
        <p>Choose a tool to get started</p>
      </div>
    </header>

    <DashboardWelcome
      v-if="showWelcome"
      @select="openTool"
    />
    <template v-else>
      <DashboardRecent @select="openTool" />
      <DashboardFavorites @select="openTool" />
      <DashboardGrid @select="openTool" />
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.branding-icon {
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

.page-header-text {
  flex: 1;
}

.page-header h1 {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

.page-header p {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
}
</style>
