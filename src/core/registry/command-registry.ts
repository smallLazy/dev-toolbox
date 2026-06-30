import type { PluginCommand } from '../plugin-types'

export interface RegisteredCommand extends PluginCommand {
  pluginId: string
}

export class CommandRegistry {
  private commands = new Map<string, RegisteredCommand>()

  register(pluginId: string, commands: PluginCommand[]): void {
    for (const cmd of commands) {
      const id = cmd.id.includes(':') ? cmd.id : `${pluginId}:${cmd.id}`
      if (this.commands.has(id)) {
        console.warn(`[CommandRegistry] Command "${id}" already registered. Overwriting.`)
      }
      this.commands.set(id, { ...cmd, id, pluginId, palette: cmd.palette ?? true })
    }
  }

  unregister(pluginId: string): void {
    for (const [id, cmd] of this.commands) {
      if (cmd.pluginId === pluginId) {
        this.commands.delete(id)
      }
    }
  }

  get(id: string): RegisteredCommand | undefined {
    return this.commands.get(id)
  }

  getAll(): RegisteredCommand[] {
    return Array.from(this.commands.values())
  }

  getByPlugin(pluginId: string): RegisteredCommand[] {
    return Array.from(this.commands.values()).filter((c) => c.pluginId === pluginId)
  }

  /** Returns only commands marked for Command Palette display */
  getPaletteCommands(): RegisteredCommand[] {
    return Array.from(this.commands.values()).filter((c) => c.palette !== false)
  }

  search(query: string): RegisteredCommand[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getPaletteCommands()

    return this.getPaletteCommands()
      .filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false) ||
          c.pluginId.toLowerCase().includes(q)
      )
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  count(): number {
    return this.commands.size
  }

  clear(): void {
    this.commands.clear()
  }
}
