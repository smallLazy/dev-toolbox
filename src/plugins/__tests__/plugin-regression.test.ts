/**
 * Plugin Name & Description Regression Tests
 *
 * Ensures all plugins follow the UI Copy Language Guidelines:
 * - Plugin names must be English (no Chinese characters)
 * - Plugin names must use Title Case (when multi-word)
 * - Plugin names with known acronyms use correct casing (RSA, SM2, GraphQL, etc.)
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
    icon?: string
    status?: string
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

// Known acronyms and their correct casing.
// Every plugin name must use the CORRECT form, not the incorrect one.
// This prevents regressions like Rsa→rsa, Graphql→graphql, etc.
const CORRECT_ACRONYM_MAP: Record<string, string> = {
  rsa: 'RSA',
  sm2: 'SM2',
  sm3: 'SM3',
  sm4: 'SM4',
  uuid: 'UUID',
  xml: 'XML',
  yaml: 'YAML',
  graphql: 'GraphQL',
  websocket: 'WebSocket',
  github: 'GitHub',
  wecom: 'WeCom',
  zentao: 'ZenTao',
  jwt: 'JWT',
  url: 'URL',
  sql: 'SQL',
  aes: 'AES',
  json: 'JSON',
  html: 'HTML',
  http: 'HTTP',
  php: 'PHP',
  curl: 'cURL',
}

// Incorrect patterns that must NOT appear in plugin names
const FORBIDDEN_NAME_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bRsa\b/, label: '"Rsa" — use "RSA"' },
  { pattern: /\bSm[234]\b/, label: '"Sm2/Sm3/Sm4" — use "SM2/SM3/SM4"' },
  { pattern: /\bUuid\b/, label: '"Uuid" — use "UUID"' },
  { pattern: /\bXml\b/, label: '"Xml" — use "XML"' },
  { pattern: /\bYaml\b/, label: '"Yaml" — use "YAML"' },
  { pattern: /\bGraphql\b/, label: '"Graphql" — use "GraphQL"' },
  { pattern: /\bHttpClient\b/, label: '"HttpClient" — use "HTTP Client"' },
  { pattern: /\bRequestDecoder\b/, label: '"RequestDecoder" — use "Request Decoder"' },
  { pattern: /\bWebsocket\b/, label: '"Websocket" — use "WebSocket"' },
  { pattern: /\bGithub\b/, label: '"Github" — use "GitHub"' },
  { pattern: /\bWecom\b/, label: '"Wecom" — use "WeCom"' },
  { pattern: /\bZentao\b/, label: '"Zentao" — use "ZenTao"' },
  { pattern: /\bQrcode\b/, label: '"Qrcode" — use "QR Code"' },
  { pattern: /\bHtmlEncode\b/, label: '"HtmlEncode" — use "HTML Encode"' },
  { pattern: /\bCurl\b/, label: '"Curl" — use "cURL"' },
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

  it('acronym-based names use correct casing (RSA, SM2, GraphQL, etc.)', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const name = plugin.definition.name
      for (const { pattern, label } of FORBIDDEN_NAME_PATTERNS) {
        if (pattern.test(name)) {
          violations.push(`Plugin "${plugin.definition.id}": name="${name}" contains ${label}`)
          break
        }
      }
    }
    expect(violations, `Plugins with incorrect acronym casing:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('multi-word plugin names use Title Case', () => {
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const name = plugin.definition.name
      // Skip single-word names
      if (!name.includes(' ') && !name.includes('-')) continue
      const words = name.split(/[\s-]+/)
      for (const word of words) {
        // Allow all-uppercase acronyms (JWT, URL, PHP, AES, SQL, JSON, HTML, HTTP, RSA, etc.)
        if (word === word.toUpperCase() && word.length >= 2) continue
        // Allow title-cased proper names (GitHub, WebSocket, GraphQL, etc.)
        if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word.slice(1))) continue
        // Allow lowercase short words
        if (['of', 'to', 'for', 'and', 'on'].includes(word.toLowerCase())) continue
        violations.push(`Plugin "${plugin.definition.id}": name="${name}", word="${word}"`)
        break
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

describe('Plugin Status Field', () => {
  it('every plugin has a valid status field', () => {
    const validStatuses = new Set(['active', 'coming-soon', 'disabled'])
    const violations: string[] = []
    for (const plugin of allPlugins) {
      const status = (plugin.definition as Record<string, unknown>).status
      if (!status || !validStatuses.has(status as string)) {
        violations.push(`Plugin "${plugin.definition.id}": status="${status}" (must be active|coming-soon|disabled)`)
      }
    }
    expect(violations, `Plugins with missing/invalid status:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('active plugins must have a dedicated router record (verified by coming-soon-safety.test.ts)', () => {
    // This is a smoke test: count active plugins and verify the count is stable
    const activePlugins = allPlugins.filter(p => {
      const status = (p.definition as Record<string, unknown>).status
      return status === 'active'
    })
    // The exact count is 12 — changing this means active tools were added/removed
    expect(activePlugins.length, 'Active plugin count must be 12').toBe(12)
  })

  it('no plugin uses emoji as its icon field', () => {
    const emojiRe = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    const violations: string[] = []
    for (const plugin of allPlugins) {
      if (plugin.definition.icon && emojiRe.test(plugin.definition.icon)) {
        violations.push(`Plugin "${plugin.definition.id}": icon="${plugin.definition.icon}" is emoji`)
      }
    }
    expect(violations, `Plugins with emoji icons:\n${violations.join('\n')}`).toHaveLength(0)
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

describe('Plugin Category Classification', () => {
  const getCategory = (pluginId: string): string | undefined => {
    const plugin = allPlugins.find(p => p.definition.id === pluginId)
    return (plugin?.definition as Record<string, unknown>).category as string | undefined
  }

  it('HTML Encode must NOT be in Crypto category', () => {
    const category = getCategory('html-encode')
    expect(category, `HTML Encode is in "${category}" — must NOT be in "crypto"`).not.toBe('crypto')
    expect(category, `HTML Encode category="${category}" — should be "encoding"`).toBe('encoding')
  })

  it('Unicode must NOT be in Crypto category', () => {
    const category = getCategory('unicode')
    expect(category, `Unicode is in "${category}" — must NOT be in "crypto"`).not.toBe('crypto')
    expect(category, `Unicode category="${category}" — should be "encoding"`).toBe('encoding')
  })

  it('AES must be in Crypto category', () => {
    const category = getCategory('crypto')
    expect(category, `AES category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('RSA must be in Crypto category', () => {
    const category = getCategory('rsa')
    expect(category, `RSA category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('SM2 must be in Crypto category', () => {
    const category = getCategory('sm2')
    expect(category, `SM2 category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('SM3 must be in Crypto category', () => {
    const category = getCategory('sm3')
    expect(category, `SM3 category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('SM4 must be in Crypto category', () => {
    const category = getCategory('sm4')
    expect(category, `SM4 category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('Hash must be in Crypto category', () => {
    const category = getCategory('hash')
    expect(category, `Hash category="${category}" — must be "crypto"`).toBe('crypto')
  })

  it('Integration tools (Gitee, GitHub, Jira, Sentry, WeCom, ZenTao) are in enterprise category', () => {
    const integrationIds = ['gitee', 'github', 'jira', 'sentry', 'wecom', 'zentao']
    const violations: string[] = []
    for (const id of integrationIds) {
      const category = getCategory(id)
      if (category !== 'enterprise') {
        violations.push(`Plugin "${id}" category="${category}" — must be "enterprise"`)
      }
    }
    expect(violations, `Integration tools with wrong category:\n${violations.join('\n')}`).toHaveLength(0)
  })
})
