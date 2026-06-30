#!/usr/bin/env npx tsx
/**
 * Navigation Validation — Quality Gate
 *
 * Checks:
 *   1. Every plugin has a valid category
 *   2. Every plugin has keywords (≥3)
 *   3. No unknown/empty categories
 *   4. No duplicate plugin IDs
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')

const VALID_CATEGORIES = [
  'encoding', 'crypto', 'formatter', 'converter',
  'network', 'enterprise', 'ai', 'analyzer', 'utility', 'developer',
]

interface NavViolation { plugin: string; rule: string; message: string }
const violations: NavViolation[] = []

function check(): void {
  const pluginsDir = path.join(ROOT, 'src', 'plugins')
  if (!fs.existsSync(pluginsDir)) return

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.plugin.ts'))
  console.log(`\n🔍 Validating ${files.length} plugins for navigation compliance...\n`)

  const ids = new Set<string>()

  for (const file of files) {
    const filePath = path.join(pluginsDir, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const pluginId = file.replace('.plugin.ts', '')

    // NAV-001: duplicate ID check
    if (ids.has(pluginId)) {
      violations.push({ plugin: pluginId, rule: 'NAV-001', message: 'Duplicate plugin ID' })
    }
    ids.add(pluginId)

    // Extract category
    const catMatch = raw.match(/category:\s*['"]([^'"]+)['"]/)
    const category = catMatch ? catMatch[1]!.trim() : ''

    // NAV-002: must have category
    if (!category) {
      violations.push({ plugin: pluginId, rule: 'NAV-002', message: 'Missing category field' })
    } else if (!VALID_CATEGORIES.includes(category)) {
      violations.push({ plugin: pluginId, rule: 'NAV-003', message: `Unknown category "${category}". Valid: ${VALID_CATEGORIES.join(', ')}` })
    }

    // NAV-004: must have keywords (≥3)
    const kwMatch = raw.match(/keywords:\s*\[([^\]]*)\]/)
    const keywords = kwMatch ? kwMatch[1]!.split(',').map(k => k.trim().replace(/['"]/g, '')).filter(Boolean) : []
    if (keywords.length < 3) {
      violations.push({ plugin: pluginId, rule: 'NAV-004', message: `Insufficient keywords (${keywords.length}). Need ≥3.` })
    }

    // NAV-005: must have commands (≥1)
    const cmdMatch = raw.match(/commands:\s*\[/)
    if (!cmdMatch) {
      violations.push({ plugin: pluginId, rule: 'NAV-005', message: 'No commands defined' })
    }
  }

  if (violations.length === 0) {
    console.log('✅ Navigation is valid. All plugins have categories, keywords, and commands.\n')
    process.exit(0)
  }

  console.log(`❌ ${violations.length} navigation violation(s):\n`)
  for (const v of violations) {
    console.log(`  [${v.rule}] ${v.plugin}`)
    console.log(`    ${v.message}\n`)
  }
  process.exit(1)
}

check()
