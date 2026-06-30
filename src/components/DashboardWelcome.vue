<script setup lang="ts">
import { computed } from 'vue'
import { APP_ICONS, Icons } from '@/design/icons'
import { useWorkspaceStore } from '@/stores/workspace'
import DashboardCard from '@/components/DashboardCard.vue'

defineEmits<{
  select: [pluginId: string]
}>()

const store = useWorkspaceStore()

const QUICK_START_IDS = ['json', 'base64', 'timestamp'] as const

const quickStartTools = computed(() =>
  QUICK_START_IDS
    .map(id => store.getTool(id))
    .filter(Boolean),
)
</script>

<template>
  <div class="welcome">
    <!-- Hero -->
    <div class="welcome-hero">
      <div class="welcome-icon-ring">
        <component :is="APP_ICONS.toolbox" :size="48" />
      </div>
      <h2 class="welcome-title">Welcome to Dev Toolbox</h2>
      <p class="welcome-desc">
        Your desktop developer toolkit — crypto, encoding, formatting,
        and inspection tools at your fingertips.
      </p>
    </div>

    <!-- Quick Start -->
    <section class="welcome-section">
      <div class="welcome-section-header">
        <Icons.Zap class="welcome-section-icon" :size="16" />
        <h3 class="welcome-section-title">Quick Start</h3>
      </div>
      <div class="welcome-cards">
        <DashboardCard
          v-for="tool in quickStartTools"
          :key="tool!.id"
          :plugin-id="tool!.id"
          :name="tool!.name"
          :description="tool!.description"
          :icon="tool!.icon"
          :path="tool!.path"
          variant="default"
          @select="(id: string) => $emit('select', id)"
        />
      </div>
    </section>

    <!-- Keyboard hint -->
    <div class="welcome-hint">
      <p>Press <kbd>Cmd+K</kbd> to search all tools</p>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

/* Hero */
.welcome-hero {
  text-align: center;
  padding: var(--space-12) 0 var(--space-8);
}

.welcome-icon-ring {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-2xl);
  background: var(--color-accent-dim);
  color: var(--color-accent-primary);
  margin-bottom: var(--space-6);
}

.welcome-title {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.welcome-desc {
  font-size: var(--text-base);
  color: var(--color-neutral-70);
  max-width: 480px;
  margin: 0 auto;
  line-height: var(--leading-relaxed);
}

/* Quick Start */
.welcome-section {
  margin-bottom: var(--space-8);
}

.welcome-section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding-left: var(--space-1);
}

.welcome-section-icon {
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

.welcome-section-title {
  font-size: var(--text-subtitle);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-90);
}

.welcome-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

/* Keyboard hint */
.welcome-hint {
  text-align: center;
  padding: var(--space-6) 0;
}

.welcome-hint p {
  font-size: var(--text-body);
  color: var(--color-neutral-60);
}

.welcome-hint kbd {
  font-size: var(--text-caption);
  padding: 2px 6px;
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  color: var(--color-neutral-80);
}
</style>
