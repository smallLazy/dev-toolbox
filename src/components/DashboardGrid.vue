<script setup lang="ts">
import { useTools } from '@/composables/useTools'
import DashboardCard from './DashboardCard.vue'

defineEmits<{
  select: [pluginId: string]
}>()

const { byCategory } = useTools()

// Display-friendly category labels
const categoryLabels: Record<string, string> = {
  crypto: 'Crypto',
  encoder: 'Encoding',
  formatter: 'Formatter',
  converter: 'Converter',
  analyzer: 'Analyzer',
  generator: 'Generator',
  network: 'Network',
  utility: 'Utility',
}
</script>

<template>
  <section class="dashboard-section">
    <h2 class="section-header">All Tools</h2>
    <div v-for="[category, tools] in byCategory" :key="category" class="category-group">
      <h3 class="category-header">{{ categoryLabels[category] ?? category }}</h3>
      <div class="section-grid">
        <DashboardCard
          v-for="tool in tools"
          :key="tool.id"
          :plugin-id="tool.id"
          :name="tool.name"
          :description="tool.description"
          :icon="tool.icon"
          :path="tool.path"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
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
  margin-bottom: var(--space-6);
}

.category-group {
  margin-bottom: var(--space-6);
}

.category-header {
  font-size: var(--text-label);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-60);
  letter-spacing: 0.08em;
  margin-bottom: var(--space-3);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(3, var(--dashboard-card-width));
  gap: var(--dashboard-grid-gap);
  max-width: var(--dashboard-grid-max-width);
}
</style>
