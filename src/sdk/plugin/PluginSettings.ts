/**
 * PluginSettings — Declarative settings definition.
 */

import type { SettingFieldDef } from './PluginManifest'

export function createSetting(def: {
  key: string
  type: 'select' | 'toggle' | 'input' | 'number'
  label: string
  description?: string
  options?: string[]
  default: unknown
}): SettingFieldDef {
  return {
    key: def.key,
    type: def.type,
    label: def.label,
    description: def.description,
    options: def.options,
    default: def.default,
  }
}

export function createSettings(
  defs: Parameters<typeof createSetting>[0][]
): Record<string, SettingFieldDef> {
  const result: Record<string, SettingFieldDef> = {}
  for (const def of defs) {
    result[def.key] = createSetting(def)
  }
  return result
}
