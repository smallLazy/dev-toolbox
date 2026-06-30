import type { ShortcutDef } from '../plugin-types'

export interface RegisteredShortcut {
  pluginId: string
  commandId: string
  def: ShortcutDef
}

export class ShortcutRegistry {
  private shortcuts = new Map<string, RegisteredShortcut>()

  register(pluginId: string, shortcutMap: Record<string, ShortcutDef>): void {
    for (const [commandId, def] of Object.entries(shortcutMap)) {
      const id = commandId.includes(':') ? commandId : `${pluginId}:${commandId}`
      this.shortcuts.set(id, { pluginId, commandId: id, def })
    }
  }

  unregister(pluginId: string): void {
    for (const [id, s] of this.shortcuts) {
      if (s.pluginId === pluginId) {
        this.shortcuts.delete(id)
      }
    }
  }

  get(commandId: string): RegisteredShortcut | undefined {
    return this.shortcuts.get(commandId)
  }

  getAll(): RegisteredShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  getByPlugin(pluginId: string): RegisteredShortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.pluginId === pluginId)
  }

  /**
   * Resolve a KeyboardEvent to a command ID.
   * Returns the command ID if a matching shortcut is found, null otherwise.
   */
  resolve(event: KeyboardEvent): string | null {
    const pressed = this.eventToString(event)
    if (!pressed) return null

    for (const [commandId, s] of this.shortcuts) {
      const shortcutStr = this.getPlatformShortcut(s.def)
      if (this.normalizeShortcut(pressed) === this.normalizeShortcut(shortcutStr)) {
        return commandId
      }
    }
    return null
  }

  count(): number {
    return this.shortcuts.size
  }

  clear(): void {
    this.shortcuts.clear()
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private getPlatformShortcut(def: ShortcutDef): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    if (isMac && def.mac) return def.mac
    return def.default
  }

  private eventToString(event: KeyboardEvent): string {
    const parts: string[] = []
    if (event.metaKey) parts.push('Cmd')
    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    // Ignore plain key presses without modifiers
    if (parts.length === 0) return ''
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
    parts.push(key)
    return parts.join('+')
  }

  private normalizeShortcut(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace('command', 'cmd')
      .replace('option', 'alt')
      .replace('return', 'enter')
      .replace('escape', 'esc')
  }
}
