/**
 * Lightweight typed Event Bus
 *
 * Uses a simple pub/sub pattern for cross-cutting communication.
 * Features MUST NOT import other Features; they communicate via the Event Bus.
 */

export type EventHandler<T = unknown> = (payload: T) => void
export type Unsubscribe = () => void

// ── Event Map ────────────────────────────────────────────────────────────

export interface WorkspaceEvents {
  'plugin:registered': { pluginId: string }
  'plugin:activated': { pluginId: string }
  'plugin:deactivated': { pluginId: string }
  'plugin:unloaded': { pluginId: string }
  'plugin:error': { pluginId: string; error: Error }

  'tool:executed': { pluginId: string; commandId?: string }
  'tool:history:added': { pluginId: string; entry: unknown }

  'search:query': { query: string }
  'search:result:selected': { pluginId: string }

  'favorite:added': { pluginId: string }
  'favorite:removed': { pluginId: string }

  'recent:touched': { pluginId: string }

  'shortcut:triggered': { commandId: string }

  'theme:changed': { mode: 'dark' | 'light' | 'system' }
  'config:changed': { pluginId: string; key: string; value: unknown }

  'clipboard:write': { text: string }
  'clipboard:read': void

  'toast:show': { variant: string; title: string; description?: string }
  'toast:dismiss': { toastId: string }

  'workspace:ready': void
  'workspace:before-unload': void
}

// ── Implementation ──────────────────────────────────────────────────────

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof WorkspaceEvents>(
    event: K,
    handler: EventHandler<WorkspaceEvents[K]>
  ): Unsubscribe {
    if (!this.handlers.has(event as string)) {
      this.handlers.set(event as string, new Set())
    }
    this.handlers.get(event as string)!.add(handler as EventHandler)

    return () => {
      this.handlers.get(event as string)?.delete(handler as EventHandler)
    }
  }

  /** Subscribe to an event once. Auto-unsubscribes after first emit. */
  once<K extends keyof WorkspaceEvents>(
    event: K,
    handler: EventHandler<WorkspaceEvents[K]>
  ): Unsubscribe {
    const wrapper: EventHandler = (payload: unknown) => {
      unsubscribe()
      ;(handler as EventHandler)(payload)
    }
    const unsubscribe = this.on(event, wrapper)
    return unsubscribe
  }

  /** Emit an event to all subscribers. */
  emit<K extends keyof WorkspaceEvents>(
    event: K,
    payload: WorkspaceEvents[K]
  ): void {
    const handlers = this.handlers.get(event as string)
    if (!handlers) return

    for (const handler of handlers) {
      try {
        handler(payload)
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event as string}":`, error)
      }
    }
  }

  /** Remove all handlers for a specific event. */
  off<K extends keyof WorkspaceEvents>(event: K): void {
    this.handlers.delete(event as string)
  }

  /** Remove all handlers for all events. */
  clear(): void {
    this.handlers.clear()
  }

  /** Get the number of subscribers for an event. */
  listenerCount<K extends keyof WorkspaceEvents>(event: K): number {
    return this.handlers.get(event as string)?.size ?? 0
  }
}

/** Global singleton event bus */
export const eventBus = new EventBus()
