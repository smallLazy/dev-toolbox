/**
 * FeatureLifecycle — Standardized lifecycle state machine.
 *
 * uninitialized → initialized → active ⇄ inactive → disposed
 */

import type { FeatureLifecyclePhase } from './types'

export interface FeatureLifecycle {
  readonly phase: FeatureLifecyclePhase
  readonly isActive: boolean
  readonly isInitialized: boolean
  readonly isDisposed: boolean

  /** Transition to a new phase. */
  transition(target: FeatureLifecyclePhase): void

  /** Register hook for a phase transition. */
  onPhaseChange(handler: (from: FeatureLifecyclePhase, to: FeatureLifecyclePhase) => void): () => void
}

export function createFeatureLifecycle(): FeatureLifecycle {
  let phase: FeatureLifecyclePhase = 'uninitialized'
  const listeners = new Set<(from: FeatureLifecyclePhase, to: FeatureLifecyclePhase) => void>()

  return {
    get phase() {
      return phase
    },
    get isActive() {
      return phase === 'active'
    },
    get isInitialized() {
      return phase !== 'uninitialized' && phase !== 'disposed'
    },
    get isDisposed() {
      return phase === 'disposed'
    },

    transition(target: FeatureLifecyclePhase): void {
      const from = phase
      phase = target
      for (const listener of listeners) {
        try {
          listener(from, target)
        } catch (e) {
          console.error('[FeatureLifecycle] Error in phase change listener:', e)
        }
      }
    },

    onPhaseChange(
      handler: (from: FeatureLifecyclePhase, to: FeatureLifecyclePhase) => void
    ): () => void {
      listeners.add(handler)
      return () => listeners.delete(handler)
    },
  }
}
