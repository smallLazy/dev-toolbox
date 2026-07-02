/**
 * FeatureToolbar — Standardized toolbar actions.
 *
 * Every Feature displays a consistent toolbar with these actions.
 * Each action maps to a Feature capability.
 */

import type { FeatureToolbarActions } from './types'

export type ToolbarAction =
  | 'copy'
  | 'paste'
  | 'clear'
  | 'swap'
  | 'favorite'
  | 'history'
  | 'settings'
  | 'refresh'
  | 'export'
  | 'import'

export interface ToolbarActionConfig {
  id: ToolbarAction
  label: string
  icon: string
  shortcut?: string
  enabled: boolean
  handler: () => void | Promise<void>
}

export interface FeatureToolbar {
  /** All available toolbar actions. */
  readonly actions: ToolbarActionConfig[]

  /** Enable or disable specific actions. */
  configure(actions: Partial<FeatureToolbarActions>): void

  /** Get a specific action config. */
  getAction(id: ToolbarAction): ToolbarActionConfig | undefined

  /** Execute a toolbar action by ID. */
  execute(id: ToolbarAction): Promise<void>
}

/**
 * Create a FeatureToolbar with default actions.
 */
export function createFeatureToolbar(
  handlers: Partial<Record<ToolbarAction, () => void | Promise<void>>> = {}
): FeatureToolbar {
  const enabled: FeatureToolbarActions = {
    copy: true,
    paste: false,
    clear: true,
    swap: true,
    favorite: true,
    history: true,
    settings: true,
    refresh: true,
    export: false,
    import: false,
  }

  function buildActions(): ToolbarActionConfig[] {
    const all: ToolbarActionConfig[] = [
      { id: 'copy', label: '复制', icon: '📋', shortcut: '⌘C', enabled: enabled.copy, handler: handlers.copy ?? (() => {}) },
      { id: 'paste', label: '粘贴', icon: '📄', enabled: enabled.paste, handler: handlers.paste ?? (() => {}) },
      { id: 'clear', label: '清空', icon: '🗑', enabled: enabled.clear, handler: handlers.clear ?? (() => {}) },
      { id: 'swap', label: '切换', icon: '⇄', enabled: enabled.swap, handler: handlers.swap ?? (() => {}) },
      { id: 'favorite', label: '收藏', icon: '⭐', enabled: enabled.favorite, handler: handlers.favorite ?? (() => {}) },
      { id: 'history', label: '历史', icon: '🕐', enabled: enabled.history, handler: handlers.history ?? (() => {}) },
      { id: 'settings', label: '设置', icon: '⚙', enabled: enabled.settings, handler: handlers.settings ?? (() => {}) },
      { id: 'refresh', label: '刷新', icon: '🔄', enabled: enabled.refresh, handler: handlers.refresh ?? (() => {}) },
      { id: 'export', label: '导出', icon: '📤', enabled: enabled.export, handler: handlers.export ?? (() => {}) },
      { id: 'import', label: '导入', icon: '📥', enabled: enabled.import, handler: handlers.import ?? (() => {}) },
    ]
    return all.filter((a) => a.enabled && handlers[a.id] !== undefined)
  }

  let actions = buildActions()

  return {
    get actions() {
      return actions
    },

    configure(partial: Partial<FeatureToolbarActions>): void {
      Object.assign(enabled, partial)
      actions = buildActions()
    },

    getAction(id: ToolbarAction): ToolbarActionConfig | undefined {
      return actions.find((a) => a.id === id)
    },

    async execute(id: ToolbarAction): Promise<void> {
      const action = actions.find((a) => a.id === id)
      if (action && action.enabled) {
        await action.handler()
      }
    },
  }
}
