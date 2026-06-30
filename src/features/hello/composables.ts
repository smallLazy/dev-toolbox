/**
 * Hello Plugin — Vue Composables
 *
 * useHelloPlugin() encapsulates all reactive state for the Hello view.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { HelloValidationResult } from './types'
import {
  getHelloVersion,
  getGreeting,
  generateSessionId,
  formatTimestamp,
  buildValidationChecklist,
  getValidationSummary,
} from './logic'

export function useHelloPlugin() {
  // ── State ──────────────────────────────────────────────────────────
  const sessionId = ref(generateSessionId())
  const version = ref(getHelloVersion())
  const greeting = ref(getGreeting('Developer'))
  const loadedAt = ref<number | null>(Date.now())
  const activatedAt = ref<number | null>(null)
  const registered = ref(false)
  const activated = ref(false)
  const registryCount = ref(1) // This plugin itself
  const commandCount = ref(2) // hello:greet + hello:version
  const shortcutCount = ref(2)
  const historyEntries = ref(0)
  const heartbeat = ref(0)

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null

  // ── Derived ────────────────────────────────────────────────────────
  const validationResults = computed<HelloValidationResult[]>(() =>
    buildValidationChecklist({
      registered: registered.value,
      activated: activated.value,
      registryCount: registryCount.value,
      commandCount: commandCount.value,
      shortcutCount: shortcutCount.value,
      historyEntries: historyEntries.value,
    })
  )

  const summary = computed(() => getValidationSummary(validationResults.value))

  const uptime = computed(() => {
    if (!loadedAt.value) return '—'
    const seconds = Math.floor((Date.now() - loadedAt.value) / 1000)
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  })

  // ── Actions ────────────────────────────────────────────────────────
  function activate(): void {
    activated.value = true
    activatedAt.value = Date.now()
    registered.value = true
    historyEntries.value = 1
  }

  function deactivate(): void {
    activated.value = false
    activatedAt.value = null
  }

  function simulateHistoryEntry(): void {
    historyEntries.value++
  }

  // ── Lifecycle ──────────────────────────────────────────────────────
  onMounted(() => {
    registered.value = true
    activate()

    // Heartbeat for uptime display
    heartbeatTimer = setInterval(() => {
      heartbeat.value++
    }, 1000)
  })

  onUnmounted(() => {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    deactivate()
  })

  return {
    // State
    sessionId,
    version,
    greeting,
    loadedAt,
    activatedAt,
    registered,
    activated,
    registryCount,
    commandCount,
    shortcutCount,
    historyEntries,

    // Derived
    validationResults,
    summary,
    uptime,

    // Actions
    activate,
    deactivate,
    simulateHistoryEntry,

    // Helpers
    formatTimestamp,
    getHelloVersion,
  }
}
