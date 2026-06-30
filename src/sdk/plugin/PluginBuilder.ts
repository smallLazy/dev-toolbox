/**
 * PluginBuilder — Fluent builder API (alternative to definePlugin).
 *
 * Usage:
 *   export default createPlugin('my-tool')
 *     .name('My Tool')
 *     .icon('🔧')
 *     .route('/my-tool')
 *     .component(() => import('...'))
 *     .build()
 */

import type { PluginCategory } from './PluginManifest'
import type { CommandDef, ShortcutDef, SettingFieldDef, PluginDefinition } from './PluginManifest'
import { definePlugin } from './definePlugin'

export function createPlugin(id: string) {
  return new PluginBuilder(id)
}

export class PluginBuilder<TFeature = unknown, TConfig = Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private def: Record<string, any> = {
    id: this._id,
    commands: [],
    shortcuts: [],
    keywords: [],
    permissions: [],
    settings: {},
  }

  constructor(private _id: string) {}

  name(val: string): this { this.def.name = val; return this }
  icon(val: string): this { this.def.icon = val; return this }
  version(val: string): this { this.def.version = val; return this }
  description(val: string): this { this.def.description = val; return this }
  category(val: PluginCategory): this { this.def.category = val; return this }
  route(val: string): this { this.def.route = val; return this }

  component(fn: () => Promise<unknown>): this { this.def.component = fn; return this }

  addCommand(def: CommandDef): this {
    this.def.commands!.push(def); return this
  }

  addShortcut(def: ShortcutDef): this {
    this.def.shortcuts!.push(def); return this
  }

  addKeyword(word: string): this {
    this.def.keywords!.push(word); return this
  }

  addPermission(perm: string): this {
    this.def.permissions!.push(perm); return this
  }

  addSetting(key: string, def: SettingFieldDef): this {
    this.def.settings![key] = def; return this
  }

  /** Finalize and create the plugin instance. */
  build() {
    return definePlugin(this.def as PluginDefinition)
  }
}
