/**
 * Command Bus — Unified command execution layer
 *
 * All user actions (button clicks, shortcuts, Command Palette selections)
 * flow through the Command Bus. Handlers are registered by Plugin commands
 * or by the Core itself (e.g., 'workspace:toggle-sidebar').
 */

export type CommandHandler = (...args: unknown[]) => unknown | Promise<unknown>

export interface CommandRegistration {
  id: string
  handler: CommandHandler
  pluginId?: string
  description?: string
}

// ── Command Bus ─────────────────────────────────────────────────────────

export class CommandBus {
  private handlers = new Map<string, CommandRegistration>()

  /** Register a command handler. */
  register(id: string, handler: CommandHandler, pluginId?: string, description?: string): void {
    if (this.handlers.has(id)) {
      console.warn(`[CommandBus] Command "${id}" is already registered. Overwriting.`)
    }
    this.handlers.set(id, { id, handler, pluginId, description })
  }

  /** Unregister a command. */
  unregister(id: string): void {
    this.handlers.delete(id)
  }

  /** Unregister all commands for a plugin. */
  unregisterPlugin(pluginId: string): void {
    for (const [id, reg] of this.handlers) {
      if (reg.pluginId === pluginId) {
        this.handlers.delete(id)
      }
    }
  }

  /** Execute a command by ID. Returns the handler's return value. */
  async execute(id: string, ...args: unknown[]): Promise<unknown> {
    const reg = this.handlers.get(id)
    if (!reg) {
      throw new Error(`[CommandBus] Command "${id}" is not registered.`)
    }
    try {
      return await reg.handler(...args)
    } catch (error) {
      console.error(`[CommandBus] Error executing command "${id}":`, error)
      throw error
    }
  }

  /** Try to execute a command. Returns null if not found, instead of throwing. */
  async tryExecute(id: string, ...args: unknown[]): Promise<unknown | null> {
    const reg = this.handlers.get(id)
    if (!reg) return null
    return this.execute(id, ...args)
  }

  /** Get all registered command IDs. */
  getAllCommandIds(): string[] {
    return Array.from(this.handlers.keys())
  }

  /** Get all commands for a specific plugin. */
  getByPlugin(pluginId: string): CommandRegistration[] {
    return Array.from(this.handlers.values()).filter((r) => r.pluginId === pluginId)
  }

  /** Check if a command is registered. */
  has(id: string): boolean {
    return this.handlers.has(id)
  }

  /** Remove all commands. */
  clear(): void {
    this.handlers.clear()
  }
}

/** Global singleton command bus */
export const commandBus = new CommandBus()
