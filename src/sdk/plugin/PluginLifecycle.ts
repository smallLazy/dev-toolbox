/**
 * PluginLifecycle — Standardized plugin lifecycle state machine.
 *
 * uninstalled → installed → registered → active ⇄ inactive → disposed
 */

export type PluginLifecyclePhase =
  | 'uninstalled'
  | 'installed'
  | 'registered'
  | 'active'
  | 'inactive'
  | 'disposed'

export interface PluginLifecycle {
  readonly phase: PluginLifecyclePhase
  readonly isActive: boolean

  transition(target: PluginLifecyclePhase): void
  onPhaseChange(handler: (from: PluginLifecyclePhase, to: PluginLifecyclePhase) => void): () => void
}

export function createPluginLifecycle(): PluginLifecycle {
  let phase: PluginLifecyclePhase = 'uninstalled'
  const listeners = new Set<(from: PluginLifecyclePhase, to: PluginLifecyclePhase) => void>()

  return {
    get phase() { return phase },
    get isActive() { return phase === 'active' },

    transition(target: PluginLifecyclePhase): void {
      const from = phase
      phase = target
      for (const listener of listeners) {
        try { listener(from, target) } catch (e) { console.error('[PluginLifecycle]', e) }
      }
    },

    onPhaseChange(handler: (from: PluginLifecyclePhase, to: PluginLifecyclePhase) => void): () => void {
      listeners.add(handler)
      return () => listeners.delete(handler)
    },
  }
}
