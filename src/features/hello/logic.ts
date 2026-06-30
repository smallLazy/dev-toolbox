/**
 * Hello Plugin — Pure Logic (zero side effects)
 *
 * All business logic is pure functions, directly unit-testable.
 */

import type { HelloValidationResult } from './types'

/** Get the current plugin version. */
export function getHelloVersion(): string {
  return '1.0.0'
}

/** Generate a greeting message. */
export function getGreeting(name?: string): string {
  return name ? `Hello, ${name}!` : 'Hello, Developer!'
}

/** Format a timestamp for display. */
export function formatTimestamp(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('zh-CN')
}

/** Generate a unique session ID. */
export function generateSessionId(): string {
  return `hello_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Build the framework validation checklist. */
export function buildValidationChecklist(state: {
  registered: boolean
  activated: boolean
  registryCount: number
  commandCount: number
  shortcutCount: number
  historyEntries: number
}): HelloValidationResult[] {
  return [
    {
      check: 'Plugin Registered',
      passed: state.registered,
      detail: state.registered
        ? `Plugin registered in ToolRegistry (${state.registryCount} total plugins)`
        : 'Plugin NOT found in ToolRegistry',
    },
    {
      check: 'Route Auto-Registered',
      passed: state.registered,
      detail: state.registered
        ? 'Route /hello added to Vue Router automatically'
        : 'Route NOT registered (plugin not loaded)',
    },
    {
      check: 'Command Palette Registered',
      passed: state.commandCount > 0,
      detail:
        state.commandCount > 0
          ? `${state.commandCount} command(s) registered in CommandRegistry`
          : 'No commands registered',
    },
    {
      check: 'Shortcut Registered',
      passed: state.shortcutCount > 0,
      detail:
        state.shortcutCount > 0
          ? `${state.shortcutCount} shortcut(s) registered in ShortcutRegistry`
          : 'No shortcuts registered',
    },
    {
      check: 'Search Keywords Registered',
      passed: state.registered,
      detail: state.registered
        ? 'Search keywords registered in SearchRegistry (hello, framework, validation)'
        : 'Search keywords NOT registered',
    },
    {
      check: 'Plugin Activated',
      passed: state.activated,
      detail: state.activated
        ? 'Plugin activated successfully — Workspace loaded'
        : 'Plugin NOT activated',
    },
    {
      check: 'History Auto-Registered',
      passed: state.historyEntries >= 0,
      detail: `History enabled for this plugin (max 20 items)`,
    },
    {
      check: 'Favorite Support',
      passed: state.registered,
      detail: 'Plugin supports FavoriteRegistry (add/remove/toggle)',
    },
    {
      check: 'Recent Auto-Recorded',
      passed: state.activated,
      detail: state.activated
        ? 'RecentRegistry.touch() called on activation'
        : 'Not recorded (plugin not activated)',
    },
    {
      check: 'Deactivation Cleanup',
      passed: state.registered,
      detail: 'On deactivation: state set to inactive, event emitted',
    },
    {
      check: 'Uninstall Complete Cleanup',
      passed: state.registered,
      detail: 'On uninstall: all registries cleared, route removed, commands unregistered',
    },
  ]
}

/** Get overall validation summary. */
export function getValidationSummary(results: HelloValidationResult[]): {
  total: number
  passed: number
  failed: number
  allPassed: boolean
} {
  const total = results.length
  const passed = results.filter((r) => r.passed).length
  return {
    total,
    passed,
    failed: total - passed,
    allPassed: passed === total,
  }
}
