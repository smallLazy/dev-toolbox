<script setup lang="ts">
import { useRecent } from '@/composables/useRecent'
import DashboardCard from './DashboardCard.vue'
import PluginEmptyState from '@/templates/PluginEmptyState.vue'
import { Icons } from '@/design/icons'

defineEmits<{
  select: [pluginId: string]
}>()

const { items, isEmpty } = useRecent(6)
</script>

<template>
  <section v-if="!isEmpty" class="dashboard-section">
    <h2 class="section-header">Recent</h2>
    <div class="section-grid">
      <DashboardCard
        v-for="tool in items"
        :key="tool.id"
        :plugin-id="tool.id"
        :name="tool.name"
        :description="tool.description"
        :icon="tool.icon"
        :path="tool.path"
        variant="recent"
        @select="$emit('select', $event)"
      />
    </div>
  </section>
  <section v-else class="dashboard-section">
    <h2 class="section-header">Recent</h2>
    <PluginEmptyState
      :icon="Icons.History"
      title="No recent tools"
      description="Tools you use will appear here."
    />
  </section>
</template>

<style scoped>
.dashboard-section {
  margin-bottom: var(--space-8);
}

.section-header {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-60);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-3);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
</style>
