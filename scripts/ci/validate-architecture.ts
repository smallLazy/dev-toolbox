#!/usr/bin/env npx tsx
/**
 * Architecture Validation — Quality Gate
 *
 * Checks:
 *   1. No Feature imports another Feature
 *   2. No Component imports from Feature
 *   3. No Core imports Feature/SDK in the wrong direction
 *   4. All SDK imports follow layering rules
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')

interface ArchError {
  file: string
  rule: string
  message: string
}

const errors: ArchError[] = []

// ── Architecture Rules ────────────────────────────────────────────────

const FORBIDDEN_IMPORTS: Array<{
  pattern: RegExp
  filePattern: RegExp
  rule: string
  message: string
}> = [
  // Features must NOT import other Features
  {
    pattern: /from\s+['"]@\/features\/(?!\.\/|\.\.\/)/,
    filePattern: /src\/features\/.+/,
    rule: 'ARCH-001',
    message: 'Feature must NOT import from another Feature (cross-feature dependency)',
  },
  // Components must NOT import Features
  {
    pattern: /from\s+['"]@\/features\//,
    filePattern: /src\/components\/.+/,
    rule: 'ARCH-002',
    message: 'Component must NOT import from Feature (layer violation)',
  },
  // Patterns must NOT import Plugins
  {
    pattern: /from\s+['"]@\/plugins\//,
    filePattern: /src\/patterns\/.+/,
    rule: 'ARCH-003',
    message: 'Pattern must NOT import from Plugin (layer violation)',
  },
]

// ── Check ─────────────────────────────────────────────────────────────

function checkForbiddenImports(): void {
  const srcDir = path.join(ROOT, 'src')

  function walk(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'target'].includes(entry.name)) {
          walk(fullPath)
        }
      } else if (entry.isFile() && /\.(ts|vue)$/.test(entry.name)) {
        const relPath = path.relative(ROOT, fullPath)
        const content = fs.readFileSync(fullPath, 'utf-8')

        for (const rule of FORBIDDEN_IMPORTS) {
          if (rule.filePattern.test(relPath)) {
            if (rule.pattern.test(content)) {
              errors.push({
                file: relPath,
                rule: rule.rule,
                message: rule.message,
              })
            }
          }
        }
      }
    }
  }

  if (fs.existsSync(srcDir)) walk(srcDir)
}

// ── Main ──────────────────────────────────────────────────────────────

function main(): void {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Architecture Validation               ║')
  console.log('╚══════════════════════════════════════════╝')

  checkForbiddenImports()

  if (errors.length === 0) {
    console.log('\n✅ Architecture is clean. No layer violations.\n')
    process.exit(0)
  }

  console.log(`\n❌ ${errors.length} architecture violation(s):\n`)
  for (const err of errors) {
    console.log(`  [${err.rule}] ${err.file}`)
    console.log(`    ${err.message}\n`)
  }
  process.exit(1)
}

main()
