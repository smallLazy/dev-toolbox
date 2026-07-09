#!/usr/bin/env node

/**
 * validate-plugin-specs.js — Plugin Spec Document Compliance Check
 *
 * Validates that every active plugin has a spec document under docs/plugin-specs/
 * and that each spec contains all required sections and valid front matter.
 *
 * Exit code: 0 = pass, 1 = violations found
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, basename } from 'path'

// ── Config ────────────────────────────────────────────────────────────────

const ROOT_DIR = join(import.meta.dirname, '..')
const PLUGINS_DIR = join(ROOT_DIR, 'src', 'plugins')
const SPECS_DIR = join(ROOT_DIR, 'docs', 'plugin-specs')

const VALID_STATUSES = new Set(['active', 'deprecated', 'archive', 'snapshot'])

// Each required section can have multiple recognized heading names.
// The first name in each array is the canonical name.
const REQUIRED_SECTIONS = [
  ['Overview'],
  ['User Goals', 'User Story'],
  ['Input', 'Inputs'],
  ['Output', 'Outputs'],
  ['Actions', 'Toolbar'],
  ['Validation'],
  ['Layout Requirements'],
  ['Test Cases'],
  ['Definition of Done', 'Acceptance Criteria'],
]

// Flatten for lookup
const REQUIRED_SECTION_ALIASES = new Map()
for (const aliases of REQUIRED_SECTIONS) {
  const canonical = aliases[0]
  for (const alias of aliases) {
    REQUIRED_SECTION_ALIASES.set(alias, canonical)
  }
}

// Pipeline presets are not standalone tools — exempt from spec requirement
const SPEC_EXEMPT_PLUGINS = new Set(['presetPhpCompatible', 'preset-php-compatible'])

const WARNING_SECTIONS = [
  'Accessibility',
  'Known Gaps',
]

const MIN_SPEC_LINES = 80

// ── State ─────────────────────────────────────────────────────────────────

let errors = 0
let warnings = 0
const errorList = []
const warningList = []

function err(file, msg) { errors++; errorList.push({ file, message: msg }) }
function warn(file, msg) { warnings++; warningList.push({ file, message: msg }) }

// ── Helpers ───────────────────────────────────────────────────────────────

function readFileIfExists(path) {
  try { return readFileSync(path, 'utf-8') } catch { return null }
}

function parseFrontMatter(content) {
  if (!content.startsWith('---')) return null
  const end = content.indexOf('---', 3)
  if (end === -1) return null
  const fmBlock = content.substring(3, end).trim()
  const fm = {}
  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    fm[line.substring(0, colonIdx).trim()] = line.substring(colonIdx + 1).trim()
  }
  return fm
}

function hasAnySection(content, aliases) {
  for (const name of aliases) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`^#{2,3}\\s+${escaped}\\s*$`, 'im')
    if (re.test(content)) return true
  }
  return false
}

function parseBarrelExports(barrelPath) {
  const content = readFileIfExists(barrelPath)
  if (!content) return []
  const ids = []
  const re = /export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*['"]\.\/(.+)\.plugin['"]/g
  let m
  while ((m = re.exec(content)) !== null) {
    ids.push({ exportName: m[1], pluginFile: m[2] + '.plugin.ts' })
  }
  return ids
}

function extractPluginId(pluginContent) {
  const m = pluginContent.match(/id:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : null
}

function extractPluginStatus(pluginContent) {
  const m = pluginContent.match(/status:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : 'active'
}

// ── Find spec file ────────────────────────────────────────────────────────

function findSpecFile(pluginId) {
  if (!existsSync(SPECS_DIR)) return null
  // Try exact match first
  const exact = join(SPECS_DIR, `${pluginId}.md`)
  if (existsSync(exact)) return exact
  // Try -spec suffix
  const specSuffix = join(SPECS_DIR, `${pluginId}-spec.md`)
  if (existsSync(specSuffix)) return specSuffix
  // Try prefix match
  for (const entry of readdirSync(SPECS_DIR)) {
    if ((entry === `${pluginId}.md` || entry === `${pluginId}-spec.md`) && entry.endsWith('.md')) {
      const p = join(SPECS_DIR, entry)
      if (existsSync(p)) return p
    }
  }
  return null
}

// ── Validate one spec ─────────────────────────────────────────────────────

function validateSpec(pluginId, specPath) {
  const specRel = relative(ROOT_DIR, specPath)
  const content = readFileIfExists(specPath)

  if (!content) {
    err(specRel, 'Spec file exists but cannot be read')
    return
  }

  const lines = content.split('\n')
  const fm = parseFrontMatter(content)

  // 1. Front matter
  if (!fm) {
    err(specRel, 'Missing front matter (must have status, last_reviewed, owner)')
  } else {
    if (!fm.status) {
      err(specRel, 'Front matter missing required field: status')
    } else if (!VALID_STATUSES.has(fm.status)) {
      err(specRel, `Invalid status "${fm.status}" — must be one of: ${[...VALID_STATUSES].join(', ')}`)
    } else if (fm.status !== 'active') {
      err(specRel, `Active plugin spec has status "${fm.status}" — must be "active"`)
    }

    if (!fm.last_reviewed) {
      err(specRel, 'Front matter missing required field: last_reviewed')
    }
    if (!fm.owner) {
      err(specRel, 'Front matter missing required field: owner')
    }
  }

  // 2. Required sections (use canonical name in error messages)
  for (const aliases of REQUIRED_SECTIONS) {
    const canonical = aliases[0]
    if (!hasAnySection(content, aliases)) {
      err(specRel, `Missing required section: "${canonical}"`)
    }
  }

  // 3. Warning sections
  for (const section of WARNING_SECTIONS) {
    if (!hasAnySection(content, [section])) {
      warn(specRel, `Missing recommended section: "${section}"`)
    }
  }

  // 4. Content length
  if (lines.length < MIN_SPEC_LINES) {
    warn(specRel, `Spec is too short (${lines.length} lines) — minimum recommended: ${MIN_SPEC_LINES}`)
  }

  // 5. TODO / TBD markers
  if (/\bTODO\b|\bTBD\b/i.test(content)) {
    // Allow TODO/TBD in Known Gaps or Future sections
    const todoLines = []
    lines.forEach((line, i) => {
      if (/\bTODO\b|\bTBD\b/i.test(line)) todoLines.push(i + 1)
    })
    warn(specRel, `Contains TODO/TBD markers at lines: ${todoLines.join(', ')}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log('🔍 validate-plugin-specs — Plugin Spec Document Compliance Check\n')

// Step 1: Get active plugins from barrel
const barrelPath = join(PLUGINS_DIR, 'index.ts')
const activePlugins = parseBarrelExports(barrelPath)

console.log(`📦 Active plugins (from barrel): ${activePlugins.length}`)

// Step 2: For each active plugin, check spec
let specsFound = 0
let specsMissing = 0
let specsChecked = 0
const allPluginIds = []

for (const { exportName, pluginFile } of activePlugins) {
  const pluginPath = join(PLUGINS_DIR, pluginFile)
  const pluginContent = readFileIfExists(pluginPath)

  if (!pluginContent) {
    console.log(`  ⚠️  Plugin file not found: ${pluginFile}`)
    continue
  }

  const pluginId = extractPluginId(pluginContent)
  const pluginStatus = extractPluginStatus(pluginContent)
  allPluginIds.push(pluginId || exportName)

  if (!pluginId) {
    err(`src/plugins/${pluginFile}`, 'Plugin has no "id" field')
    continue
  }

  if (pluginStatus !== 'active') {
    console.log(`  ⏭️  ${pluginId}: status="${pluginStatus}" — skipping spec check`)
    continue
  }

  const specPath = findSpecFile(pluginId)
  if (!specPath) {
    if (SPEC_EXEMPT_PLUGINS.has(pluginId) || SPEC_EXEMPT_PLUGINS.has(exportName)) {
      console.log(`  ⏭️  ${pluginId}: spec exempt (pipeline preset)`)
      continue
    }
    err(pluginId, `Missing spec document: docs/plugin-specs/${pluginId}.md`)
    specsMissing++
    continue
  }

  specsFound++
  validateSpec(pluginId, specPath)
  specsChecked++
}

// Step 3: Count total plugin files
const totalPluginFiles = existsSync(PLUGINS_DIR)
  ? readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.plugin.ts')).length
  : 0

// ── Output ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`)

if (errorList.length > 0) {
  console.log(`\n❌ Errors (${errorList.length}):\n`)
  for (const e of errorList) {
    console.log(`  ${e.file}`)
    console.log(`     ${e.message}`)
  }
  console.log()
}

if (warningList.length > 0) {
  console.log(`⚠️  Warnings (${warningList.length}):\n`)
  for (const w of warningList) {
    console.log(`  ${w.file}`)
    console.log(`     ${w.message}`)
  }
  console.log()
}

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`${'─'.repeat(60)}`)
console.log(`\n📊 Summary:`)
console.log(`   Total plugin files:        ${totalPluginFiles}`)
console.log(`   Active plugins (barrel):    ${activePlugins.length}`)
console.log(`   Specs found:                ${specsFound}`)
console.log(`   Specs missing:              ${specsMissing}`)
console.log(`   Specs checked:              ${specsChecked}`)
console.log(`   Errors:                     ${errors}`)
console.log(`   Warnings:                   ${warnings}`)

if (errors === 0 && warnings === 0) {
  console.log(`\n✅ PASS — All active plugins have compliant spec documents.`)
} else if (errors === 0) {
  console.log(`\n✅ PASS — Plugin spec validation passed (with ${warnings} warning(s)).`)
} else {
  console.log(`\n❌ FAIL — ${errors} spec violation(s) must be fixed.`)
}

console.log()

process.exit(errors > 0 ? 1 : 0)
