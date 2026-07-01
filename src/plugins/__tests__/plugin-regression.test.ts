/**
 * Plugin Name & Description Regression Tests
 *
 * Ensures all plugins follow the UI Copy Language Guidelines:
 * - Plugin names must be English (no Chinese characters)
 * - Plugin names must use Title Case (when multi-word)
 * - Plugin descriptions must be English
 * - Every plugin must define a valid route path
 *
 * Reference: docs/design/ui-copy-guidelines.md
 */

import { describe, it, expect } from 'vitest'
import * as pluginModules from '../index'

const allPlugins = Object.values(pluginModules) as Array<{
  id: string
  definition: {
    id: string
    name: string
    description?: string
    route: string | { path: string }
  }
}>

// Chinese character range (CJK Unified Ideographs)
const CHINESE_RE = /[一-鿿]/

// Whitelist: plugins explicitly allowed to have Chinese names
// (per ui-copy-guidelines.md Section 7: Chinese-specific tools or services)
const CHINESE_NAME_WHITELIST: string[] = [
  // 'zentao',  // 禅道 — Chinese service integration (if approved)
  // 'wecom',   // 企业微信 — Chinese service integration (if approved)
]

describe('Plugin Name Convention', () => {
  it('all plugin names are defined', () => {
    for (const plugin of allPlugins) {
      expect(plugin.definition.name, `Plugin "${plugin.definition.id}" has no name`).toBeTruthy()
    }
  })

  it('no plugin name contains Chinese characters (unless whitelisted)', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      if (CHINESE_NAME_WHITELIST.includes(plugin.definition.id)) continue
      if (CHINESE_RE.test(plugin.definition.name)) {
        violations.push(`Plugin "${plugin.definition.id}": name="${plugin.definition.name}"`)
      }
    }
    expect(violations, `Plugins with Chinese names:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('plugin names use Title Case for multi-word names', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const name = plugin.definition.name
      // Skip single-word names and acronyms
      if (!name.includes(' ') && !name.includes('-')) continue
      // Check that each word starts with uppercase (or is an acronym like JWT, URL, etc.)
      const words = name.split(/[\s-]+/)
      for (const word of words) {
        // Allow all-uppercase acronyms (JWT, URL, PHP, AES, SQL, JSON, HTML, HTTP)
        if (word === word.toUpperCase() && word.length >= 2) continue
        // Allow lowercase short words (of, to, for)
        if (['of', 'to', 'for', 'and', 'on'].includes(word.toLowerCase())) continue
        // First character should be uppercase
        if (word[0] !== word[0].toUpperCase()) {
          violations.push(`Plugin "${plugin.definition.id}": name="${name}", word="${word}"`)
          break
        }
      }
    }
    expect(violations, `Plugins with non-Title-Case names:\n${violations.join('\n')}`).toHaveLength(0)
  })
})

describe('Plugin Description Convention', () => {
  it('no plugin description contains Chinese characters', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const desc = plugin.definition.description ?? ''
      if (CHINESE_RE.test(desc)) {
        violations.push(`Plugin "${plugin.definition.id}": description="${desc}"`)
      }
    }
    expect(violations, `Plugins with Chinese descriptions:\n${violations.join('\n')}`).toHaveLength(0)
  })
})

describe('Plugin Route Validity', () => {
  it('every plugin defines a valid route path', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const route = plugin.definition.route
      if (!route) {
        violations.push(`Plugin "${plugin.definition.id}" has no route`)
        continue
      }
      const path = typeof route === 'string' ? route : route.path
      if (!path || !path.startsWith('/')) {
        violations.push(`Plugin "${plugin.definition.id}": route path must start with "/", got "${path}"`)
      }
    }
    expect(violations, `Plugins with invalid routes:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('no duplicate route paths among plugins', () => {
    const paths = new Map<string, string[]>()
    for (const plugin of allPlugins) {
      const path = typeof plugin.definition.route === 'string'
        ? plugin.definition.route
        : plugin.definition.route.path
      if (!paths.has(path)) paths.set(path, [])
      paths.get(path)!.push(plugin.definition.id)
    }
    const duplicates = Array.from(paths.entries()).filter(([, ids]) => ids.length > 1)
    expect(duplicates, `Duplicate routes:\n${duplicates.map(([p, ids]) => `  ${p}: ${ids.join(', ')}`).join('\n')}`).toHaveLength(0)
  })
})
