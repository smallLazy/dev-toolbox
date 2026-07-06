<script setup lang="ts">
import { watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { Icons } from '@/design/icons'
import CommandPaletteItem from './CommandPaletteItem.vue'
import PluginEmptyState from '@/templates/PluginEmptyState.vue'

const {
  isOpen,
  query,
  paletteItems,
  selectedIndex,
  open,
  close,
  moveUp,
  moveDown,
  execute,
} = useCommandPalette()

const searchInput = ref<HTMLInputElement | null>(null)
const palettePanel = ref<HTMLElement | null>(null)

// ── Auto-focus search when opened ────────────────────────────────────

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    searchInput.value?.focus()
  }
})

// ── Keyboard handler ─────────────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'ArrowDown':
      e.preventDefault()
      moveDown()
      break
    case 'ArrowUp':
      e.preventDefault()
      moveUp()
      break
    case 'Enter':
      e.preventDefault()
      execute()
      break
  }
}

// ── External open trigger (Cmd+K from App.vue) ──────────────────────

function onExternalOpen() {
  open()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('workspace:open-palette', onExternalOpen)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('workspace:open-palette', onExternalOpen)
})

// ── Focus-out handler — close when focus leaves the palette panel ──

function onFocusOut(e: FocusEvent) {
  // If focus moves to an element still inside the palette panel, keep open.
  const related = e.relatedTarget as HTMLElement | null
  if (related && palettePanel.value?.contains(related)) return
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="isOpen" class="palette-overlay" @click.self="close">
        <div ref="palettePanel" class="palette-panel" role="dialog" aria-label="Command Palette" @focusout="onFocusOut">
          <!-- Search -->
          <div class="palette-search">
            <Icons.Search class="palette-search-icon" :size="14" />
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              class="palette-search-input"
              placeholder="Search tools and commands..."
              role="combobox"
              aria-expanded="true"
              aria-label="Search tools and commands"
              aria-autocomplete="list"
              aria-controls="palette-list"
            />
          </div>

          <!-- Results -->
          <div id="palette-list" class="palette-list" role="listbox">
            <CommandPaletteItem
              v-for="(item, index) in paletteItems"
              :key="item.id"
              :item="item"
              :active="index === selectedIndex"
              @select="selectedIndex = index; execute()"
              @hover="selectedIndex = index"
            />
            <PluginEmptyState
              v-if="paletteItems.length === 0"
              :icon="Icons.Search"
              title="No results found"
              description="Try searching for a different tool name."
            />
          </div>

          <!-- Footer -->
          <div class="palette-footer">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Cancel</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ──────────────────────────────────────────────────────── */
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  background: var(--color-surface-overlay);
}

/* ── Panel ────────────────────────────────────────────────────────── */
.palette-panel {
  width: var(--command-palette-width);
  max-width: calc(100vw - 40px);
  max-height: var(--command-palette-max-height);
  display: flex;
  flex-direction: column;
  background: var(--color-neutral-15);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  align-self: flex-start;
}

/* ── Search ───────────────────────────────────────────────────────── */
.palette-search {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width-thin) solid var(--sidebar-divider);
}

.palette-search-icon {
  position: absolute;
  left: calc(var(--space-4) + var(--space-3));
  color: var(--sidebar-icon);
  pointer-events: none;
}

.palette-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-md);
  background: var(--color-neutral-20);
  color: var(--sidebar-text);
  font-size: var(--text-body);
  font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--duration-fast), background var(--duration-fast);
}

.palette-search-input:focus {
  background: var(--color-neutral-25);
  border-color: var(--border-color-focus);
}

.palette-search-input::placeholder {
  color: var(--sidebar-text-secondary);
}

/* ── Results ──────────────────────────────────────────────────────── */
.palette-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.palette-empty {
  padding: var(--space-10) var(--space-4);
  text-align: center;
  color: var(--sidebar-text-secondary);
  font-size: var(--text-body);
}

/* ── Footer ───────────────────────────────────────────────────────── */
.palette-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-top: var(--border-width-thin) solid var(--sidebar-divider);
  font-size: var(--text-caption);
  color: var(--color-neutral-70);
  font-family: var(--font-sans);
}

/* ── Transitions ──────────────────────────────────────────────────── */
.palette-enter-active {
  transition: opacity var(--duration-entrance) var(--ease-standard),
              transform var(--duration-entrance) var(--ease-spring);
}

.palette-leave-active {
  transition: opacity var(--duration-fast) var(--ease-accelerate);
}

.palette-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.palette-leave-to {
  opacity: 0;
}
</style>
