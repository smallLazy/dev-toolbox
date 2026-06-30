/**
 * LifecycleManager — Workspace Lifecycle Orchestrator
 *
 * Manages the overall workspace lifecycle phases:
 *   BOOT → READY → ACTIVE → SUSPENDED → SHUTDOWN
 *
 * Each phase triggers hooks that other systems can subscribe to.
 */

export type LifecyclePhase = 'boot' | 'ready' | 'active' | 'suspended' | 'shutdown'

export type LifecycleHook = () => void | Promise<void>

export interface LifecycleOptions {
  onBoot?: LifecycleHook[]
  onReady?: LifecycleHook[]
  onActive?: LifecycleHook[]
  onSuspend?: LifecycleHook[]
  onShutdown?: LifecycleHook[]
}

export class LifecycleManager {
  private phase: LifecyclePhase = 'boot'
  private hooks: Map<LifecyclePhase, Set<LifecycleHook>>
  private startTime: number

  constructor(options: LifecycleOptions = {}) {
    this.startTime = Date.now()
    this.hooks = new Map()

    // Register initial hooks
    for (const phase of ['boot', 'ready', 'active', 'suspended', 'shutdown'] as LifecyclePhase[]) {
      this.hooks.set(phase, new Set())
      const phaseHooks = options[`on${phase.charAt(0).toUpperCase() + phase.slice(1)}` as keyof LifecycleOptions] as LifecycleHook[] | undefined
      if (phaseHooks) {
        for (const hook of phaseHooks) {
          this.hooks.get(phase)!.add(hook)
        }
      }
    }
  }

  // ── Phase Management ──────────────────────────────────────────────────

  /** Get current lifecycle phase. */
  getPhase(): LifecyclePhase {
    return this.phase
  }

  /** Get milliseconds since workspace started. */
  getUptime(): number {
    return Date.now() - this.startTime
  }

  // ── Hook Registration ─────────────────────────────────────────────────

  /** Register a hook for a specific phase. Returns unsubscribe function. */
  on(phase: LifecyclePhase, hook: LifecycleHook): () => void {
    this.hooks.get(phase)!.add(hook)
    return () => {
      this.hooks.get(phase)?.delete(hook)
    }
  }

  /** Register a hook that runs once at the next occurrence of a phase. */
  once(phase: LifecyclePhase, hook: LifecycleHook): () => void {
    const wrapper: LifecycleHook = async () => {
      unsubscribe()
      await hook()
    }
    const unsubscribe = this.on(phase, wrapper)
    return unsubscribe
  }

  // ── Phase Transitions ─────────────────────────────────────────────────

  /** Transition from BOOT → READY. Called after all plugins are registered. */
  async ready(): Promise<void> {
    if (this.phase !== 'boot') {
      console.warn(`[LifecycleManager] Cannot transition to READY from ${this.phase}`)
      return
    }
    await this.transition('ready')
  }

  /** Transition from READY → ACTIVE. Called when the workspace UI is fully rendered. */
  async activate(): Promise<void> {
    if (this.phase !== 'ready') {
      console.warn(`[LifecycleManager] Cannot transition to ACTIVE from ${this.phase}`)
      return
    }
    await this.transition('active')
  }

  /** Transition to SUSPENDED. Called when the window loses focus or is minimized. */
  async suspend(): Promise<void> {
    if (this.phase !== 'active') return
    await this.transition('suspended')
  }

  /** Transition from SUSPENDED → ACTIVE. Called when the window regains focus. */
  async resume(): Promise<void> {
    if (this.phase !== 'suspended') return
    await this.transition('active')
  }

  /** Transition to SHUTDOWN. Called before the window closes. Final cleanup. */
  async shutdown(): Promise<void> {
    if (this.phase === 'shutdown') return
    await this.transition('shutdown')
  }

  // ── Internal ──────────────────────────────────────────────────────────

  private async transition(target: LifecyclePhase): Promise<void> {
    const previous = this.phase
    this.phase = target

    const phaseHooks = this.hooks.get(target)
    if (!phaseHooks) return

    const promises: Promise<void>[] = []
    for (const hook of phaseHooks) {
      try {
        const result = hook()
        if (result instanceof Promise) {
          promises.push(result)
        }
      } catch (error) {
        console.error(`[LifecycleManager] Error in ${target} hook:`, error)
      }
    }

    await Promise.allSettled(promises)

    console.debug(
      `[LifecycleManager] Phase transition: ${previous} → ${target} (${this.getUptime()}ms)`
    )
  }
}
