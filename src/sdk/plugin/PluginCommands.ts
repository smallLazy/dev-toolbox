/**
 * PluginCommands — Declarative command & shortcut builders.
 */

import type { CommandDef, ShortcutDef } from './PluginManifest'

// ── Command Builder ─────────────────────────────────────────────────────

export function createCommand(def: {
  id: string
  label: string
  description?: string
  shortcut?: string
  palette?: boolean
}): CommandDef {
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    shortcut: def.shortcut,
    palette: def.palette ?? true,
  }
}

// ── Shortcut Builder ────────────────────────────────────────────────────

export function createShortcut(def: {
  commandId: string
  default: string
  mac?: string
  win?: string
  linux?: string
}): ShortcutDef {
  return {
    commandId: def.commandId,
    default: def.default,
    mac: def.mac,
    win: def.win,
    linux: def.linux,
  }
}

// ── Batch Creators ─────────────────────────────────────────────────────

export function createCommands(defs: Parameters<typeof createCommand>[0][]): CommandDef[] {
  return defs.map(createCommand)
}

export function createShortcuts(defs: Parameters<typeof createShortcut>[0][]): ShortcutDef[] {
  return defs.map(createShortcut)
}
