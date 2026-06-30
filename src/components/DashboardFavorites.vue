<script setup lang="ts">
import { useFavorites } from '@/composables/useFavorites'
import DashboardCard from './DashboardCard.vue'
import PluginEmptyState from '@/templates/PluginEmptyState.vue'
import { Icons } from '@/design/icons'

defineEmits<{
  select: [pluginId: string]
}>()

const { items, isEmpty } = useFavorites()
</script>

<template>
  <section v-if="!isEmpty" class="dashboard-section">
    <h2 class="section-header">Favorites</h2>
    <div class="section-grid">
      <DashboardCard
        v-for="tool in items"
        :key="tool.id"
        :plugin-id="tool.id"
        :name="tool.name"
        :description="tool.description"
        :icon="tool.icon"
        :path="tool.path"
        variant="favorite"
        @select="$emit('select', $event)"
      />
    </div>
  </section>
  <section v-else class="dashboard-section">
    <h2 class="section-header">Favorites</h2>
    <PluginEmptyState
      :icon="Icons.Star"
      title="No favorites"
      description="Star tools to pin them here for quick access."
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
  grid-template-columns: repeat(3, var(--dashboard-card-width));
  gap: var(--dashboard-grid-gap);
  max-width: var(--dashboard-grid-max-width);
}
</style>
