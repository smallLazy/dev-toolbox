#!/usr/bin/env npx tsx
/**
 * Design Validation — Quality Gate
 *
 * Checks:
 *   1. No hardcoded hex colors in Vue/CSS files
 *   2. No hardcoded px values (must use var(--space-*))
 *   3. No emoji usage in component templates (use SVG icons)
 *   4. All spacing uses Design Tokens
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')

interface DesignViolation {
  file: string
  line: number
  rule: string
  message: string
}

const violations: DesignViolation[] = []

// ── Rules ──────────────────────────────────────────────────────────────

/**
 * Check for hardcoded hex colors.
 * Allowed: CSS variables (var(--*)), SVG inline fills, rgba()
 */
const HEX_COLOR_RE = /(?<!var\(--)(?<![\w-])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g

/**
 * Check for hardcoded px values that should use space tokens.
 * Allowed: borders (1px, 2px, 3px), special values (0, 1px, 14px for spinner)
 */
const HARDCODED_PX_RE = /\b(?:padding|margin|gap):\s*\d+px\b/g
const HARDCODED_PX_INLINE_RE = /(?<!var\(--space-)\b(?:padding|margin|gap):\s*\d+px\b/g

/**
 * Check for emoji characters in Vue templates (not in comments).
 */
const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u

// ── Check Functions ────────────────────────────────────────────────────

function checkFile(filePath: string, relPath: string): void {
  // Skip generated files, node_modules, dist
  if (relPath.includes('node_modules') || relPath.includes('/dist/') || relPath.includes('/target/')) return
  if (relPath.includes('__tests__')) return
  if (!/\.(vue|css|ts)$/.test(filePath)) return

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Skip comments and @ts-nocheck
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue
    if (line.includes('@ts-nocheck')) continue
    if (line.trim().startsWith('*')) continue

    // Check hardcoded hex (only in <style> blocks or CSS files)
    if (/\.(css|vue)$/.test(filePath) || line.includes('style')) {
      const hexMatches = line.matchAll(HEX_COLOR_RE)
      for (const _match of hexMatches) {
        // Allow in url(), SVG data URIs, and comments
        if (line.includes('url(') || line.includes('data:')) continue
        violations.push({
          file: relPath, line: lineNum, rule: 'DESIGN-001',
          message: `Hardcoded hex color. Use var(--color-*) or var(--token).`,
        })
      }
    }

    // Check hardcoded px spacing
    const pxMatches = line.matchAll(/\b(?:padding|margin|gap)\s*:\s*(\d+)px\b/g)
    for (const match of pxMatches) {
      const value = parseInt(match[1]!)
      // Allow 0px, 1px (borders), 2px (fine spacing)
      if (value > 2) {
        const tokenHint = value <= 4 ? 'var(--space-1)' :
                         value <= 8 ? 'var(--space-2)' :
                         value <= 12 ? 'var(--space-3)' :
                         value <= 16 ? 'var(--space-4)' :
                         value <= 20 ? 'var(--space-5)' :
                         'var(--space-*)'
        violations.push({
          file: relPath, line: lineNum, rule: 'DESIGN-002',
          message: `Hardcoded spacing: ${match[0]}. Use Design Token instead (e.g., ${tokenHint}).`,
        })
      }
    }

    // Check emoji in templates (not in comments or strings)
    if (line.includes('<template>') || (relPath.endsWith('.vue') && !line.trim().startsWith('//'))) {
      if (EMOJI_RE.test(line) && !line.includes('<!--')) {
        violations.push({
          file: relPath, line: lineNum, rule: 'DESIGN-003',
          message: 'Emoji found in template. Use SVG icon from @/design/icons instead.',
        })
      }
    }
  }
}

function walk(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'target', '__tests__'].includes(entry.name)) {
        walk(fullPath)
      }
    } else if (entry.isFile()) {
      checkFile(fullPath, path.relative(ROOT, fullPath))
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────

function main(): void {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Design Validation                     ║')
  console.log('╚══════════════════════════════════════════╝\n')

  const srcDir = path.join(ROOT, 'src')
  if (fs.existsSync(srcDir)) walk(srcDir)

  if (violations.length === 0) {
    console.log('✅ Design is clean. All Design Tokens used correctly.\n')
    process.exit(0)
  }

  console.log(`❌ ${violations.length} design violation(s):\n`)
  for (const v of violations) {
    console.log(`  [${v.rule}] ${v.file}:${v.line}`)
    console.log(`    ${v.message}\n`)
  }
  process.exit(1)
}

main()
