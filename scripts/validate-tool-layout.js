#!/usr/bin/env node

/**
 * validate-tool-layout.js — Tool Page Layout Compliance Check
 *
 * Validates that all active plugin views conform to the standard tool layout:
 *   - ToolLayout as outer shell
 *   - ToolWorkspace as content layout (for I/O tools)
 *   - InputOutputPanel for input/output
 *   - ToolActionBar for actions
 *   - Output panels have readonly
 *   - No usage of old layout components as primary structure
 *
 * Exit code: 0 = pass, 1 = violations found
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, basename, dirname } from 'path'

// ── Config ────────────────────────────────────────────────────────────────

const ROOT_DIR = join(import.meta.dirname, '..')
const PLUGINS_DIR = join(ROOT_DIR, 'src', 'plugins')
const FEATURES_DIR = join(ROOT_DIR, 'src', 'features')
const PLUGIN_SPECS_DIR = join(ROOT_DIR, 'docs', 'plugin-specs')

// Layout components that represent the current standard
const NEW_LAYOUT_COMPONENTS = ['ToolLayout', 'ToolWorkspace', 'InputOutputPanel', 'ToolActionBar',
  'ToolOptionsRow', 'ToolOptionGroup', 'ToolStatusBar', 'ToolSegmentedControl']

// Old/discouraged layout components — must NOT be used as primary tool structure
const OLD_LAYOUT_COMPONENTS = ['ToolPage', 'ToolSection', 'ToolActions', 'ToolOutputPanel']

// Tools with known legitimate custom layouts that deviate from standard io pattern.
// Each entry MUST have a reason.
const CUSTOM_LAYOUT_ALLOWLIST = new Map([
  ['diff', 'Twin-input comparison tool — uses dual-input workspace with unified diff output viewer. Still uses ToolLayout + ToolWorkspace + InputOutputPanel.'],
])

// Non-I/O tool categories (viewers, inspectors, generators)
const NON_IO_CATEGORIES = new Set(['ai', 'utility'])

// ── State ─────────────────────────────────────────────────────────────────

let errors = 0
let warnings = 0
let missingSpecs = []
const scannedViews = []
const errorList = []
const warningList = []

function error(viewRel, msg) {
  errors++
  errorList.push({ file: viewRel, message: msg })
}

function warn(viewRel, msg) {
  warnings++
  warningList.push({ file: viewRel, message: msg })
}

// ── Helpers ───────────────────────────────────────────────────────────────

function readFileIfExists(filePath) {
  try { return readFileSync(filePath, 'utf-8') } catch { return null }
}

function findFile(dir, pattern) {
  if (!existsSync(dir)) return null
  for (const entry of readdirSync(dir)) {
    if (pattern.test(entry)) return join(dir, entry)
  }
  return null
}

/**
 * Parse barrel export lines like:
 *   export { default as base64 } from './base64.plugin'
 * Returns array of plugin IDs.
 */
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

/**
 * Extract component path from plugin definition like:
 *   component: () => import('@/features/base64/Base64View.vue'),
 */
function extractPluginId(pluginContent) {
  const m = pluginContent.match(/id:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : null
}

function extractComponentPath(pluginContent) {
  const m = pluginContent.match(/component:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/)
  return m ? m[1] : null
}

/**
 * Extract plugin status from definition.
 */
function extractPluginStatus(pluginContent) {
  const m = pluginContent.match(/status:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : 'active'
}

/**
 * Extract plugin category from definition.
 */
function extractPluginCategory(pluginContent) {
  const m = pluginContent.match(/category:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : 'unknown'
}

/**
 * Resolve @/ alias path to absolute filesystem path.
 */
function resolveAtAlias(importPath) {
  return join(ROOT_DIR, 'src', importPath.replace('@/', ''))
}

// ── Checks ────────────────────────────────────────────────────────────────

/**
 * Check if content imports a specific component.
 */
function hasImport(content, componentName) {
  // Match: import ComponentName from '@/templates/ComponentName.vue'
  const re = new RegExp(`import\\s+${componentName}\\s+from\\s+['"]@/templates/${componentName}\\.vue['"]`)
  return re.test(content)
}

/**
 * Get the import name to check — returns the local name if aliased.
 */
function getImportNames(content) {
  const names = {}
  // Match: import Name from '...'
  const re = /import\s+(\w+)\s+from\s+['"]@\/templates\/(\w+)\.vue['"]/g
  let m
  while ((m = re.exec(content)) !== null) {
    names[m[2]] = m[1] // componentFileName -> localName
  }
  return names
}

/**
 * Check template for component usage.
 */
function templateHasTag(content, tagName) {
  // <TagName or <tag-name (kebab-case)
  const kebab = tagName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  return new RegExp(`<${tagName}[\\s>]`, 'g').test(content) ||
         new RegExp(`<${kebab}[\\s>]`, 'g').test(content)
}

/**
 * Check if template uses old layout components as primary structure.
 * "Primary structure" means they appear at the top level (not deeply nested).
 */
function hasOldLayoutComponents(content) {
  const found = []
  for (const comp of OLD_LAYOUT_COMPONENTS) {
    if (templateHasTag(content, comp)) {
      found.push(comp)
    }
  }
  return found
}

/**
 * Check if output panel has readonly attribute.
 * Looks for: InputOutputPanel with readonly or :readonly="true"
 */
function outputHasReadonly(content) {
  // Find output panels: <InputOutputPanel ... title="Output"
  // and check for readonly
  // Simple heuristic: any readonly attribute on InputOutputPanel with title containing "output" (case insensitive)
  const outputPanelPattern = /<InputOutputPanel[^>]*title\s*=\s*['"]output['"][^>]*>/gi
  const outputMatches = content.match(outputPanelPattern)
  if (!outputMatches || outputMatches.length === 0) return null // No output panel found — not an error yet
  for (const match of outputMatches) {
    if (/\breadonly\b/.test(match)) continue
    return false // Found output panel without readonly
  }
  return true
}

/**
 * Check if layout="custom" has a justifying comment before it.
 */
function customLayoutHasComment(content) {
  const customLines = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('layout="custom"') || lines[i].includes("layout='custom'")) {
      // Check previous 3 lines for a comment
      let hasComment = false
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (lines[j].trim().startsWith('//') || lines[j].trim().startsWith('/*') || lines[j].trim().startsWith('*')) {
          hasComment = true
          break
        }
      }
      // Also check for inline comment on same line
      if (!hasComment && (lines[i].includes('//') || lines[i].includes('/*'))) {
        hasComment = true
      }
      if (!hasComment) {
        customLines.push(i + 1)
      }
    }
  }
  return customLines.length === 0 ? true : customLines
}

/**
 * Check if ToolWorkspace uses explicit layout attribute.
 */
function workspaceHasLayout(content) {
  // Check for: <ToolWorkspace layout="..." or :layout="..."
  const m = content.match(/<ToolWorkspace[^>]*\blayout\s*=\s*['"]([^'"]+)['"]/)
  if (!m) {
    // Check for :layout binding
    const m2 = content.match(/<ToolWorkspace[^>]*:layout\s*=\s*['"]([^'"]+)['"]/)
    return m2 ? m2[1] : null
  }
  return m[1]
}

/**
 * Check for hand-written card/panel classes (indicating custom layout).
 */
function countCustomCards(content) {
  const cardClasses = content.match(/class\s*=\s*['"][^'"]*\b(card|panel|section)\b[^'"]*['"]/gi)
  return cardClasses ? cardClasses.length : 0
}

/**
 * Detect if a view is I/O type based on imports and template structure.
 */
function isIOTool(content) {
  return hasImport(content, 'InputOutputPanel') ||
         hasImport(content, 'ToolWorkspace') ||
         (content.includes('modelValue') && content.includes('readonly'))
}

// ── Plugin spec check ────────────────────────────────────────────────────

// Pipeline presets exempt from spec requirement
const SPEC_EXEMPT = new Set(['presetPhpCompatible', 'preset-php-compatible'])

function hasPluginSpec(pluginId) {
  if (SPEC_EXEMPT.has(pluginId)) return true
  if (!existsSync(PLUGIN_SPECS_DIR)) return false
  for (const entry of readdirSync(PLUGIN_SPECS_DIR)) {
    if (entry.startsWith(pluginId) && entry.endsWith('.md')) return true
  }
  return false
}

// ── Main validation ───────────────────────────────────────────────────────

function validateView(viewPath, pluginId, pluginCategory) {
  const viewRel = relative(ROOT_DIR, viewPath)
  const content = readFileIfExists(viewPath)

  if (!content) {
    error(viewRel, `Active plugin "${pluginId}" view file not found at ${viewPath}`)
    return
  }

  scannedViews.push({ pluginId, viewPath: viewRel, category: pluginCategory })

  const isIO = isIOTool(content)
  const isAllowlisted = CUSTOM_LAYOUT_ALLOWLIST.has(pluginId)
  const importNames = getImportNames(content)

  // ── ERROR: Must use ToolLayout ──────────────────────────────────────
  if (!hasImport(content, 'ToolLayout')) {
    error(viewRel, 'Missing ToolLayout — tool page must use <ToolLayout> as the outer shell')
  } else if (!templateHasTag(content, 'ToolLayout')) {
    error(viewRel, 'ToolLayout imported but not used in template — add <ToolLayout> wrapper')
  }

  // ── ERROR: I/O tools must use ToolWorkspace ─────────────────────────
  if (isIO && !isAllowlisted) {
    if (!hasImport(content, 'ToolWorkspace')) {
      error(viewRel, 'I/O tool missing ToolWorkspace — must use <ToolWorkspace layout="io">')
    } else if (!templateHasTag(content, 'ToolWorkspace')) {
      error(viewRel, 'ToolWorkspace imported but not used in template')
    }
  }

  // ── ERROR: Must not use old layout components ───────────────────────
  const oldComps = hasOldLayoutComponents(content)
  if (oldComps.length > 0) {
    error(viewRel, `Uses deprecated layout component(s): ${oldComps.join(', ')}. ` +
      `Replace with ToolLayout + ToolWorkspace + InputOutputPanel + ToolActionBar.`)
  }

  // ── ERROR: Output panel must have readonly ──────────────────────────
  if (isIO) {
    const roCheck = outputHasReadonly(content)
    if (roCheck === false) {
      error(viewRel, 'Output InputOutputPanel missing readonly attribute')
    }
  }

  // ── ERROR: layout="custom" must have comment justification ──────────
  const customCheck = customLayoutHasComment(content)
  if (Array.isArray(customCheck)) {
    error(viewRel, `layout="custom" at lines ${customCheck.join(', ')} without justifying comment. ` +
      `Add a comment explaining why standard io/editor layout cannot be used.`)
  }

  // ── WARNING: Missing ToolActionBar ──────────────────────────────────
  if (isIO && !hasImport(content, 'ToolActionBar')) {
    warn(viewRel, 'Missing ToolActionBar — consider using <ToolActionBar> for primary/secondary actions')
  }

  // ── WARNING: ToolWorkspace layout not explicitly declared ────────────
  if (hasImport(content, 'ToolWorkspace') && templateHasTag(content, 'ToolWorkspace')) {
    const layout = workspaceHasLayout(content)
    if (!layout) {
      warn(viewRel, 'ToolWorkspace layout not explicitly declared — add layout="io", layout="editor", or layout="custom"')
    }
  }

  // ── WARNING: Excessive custom card classes ──────────────────────────
  if (!isAllowlisted) {
    const cardCount = countCustomCards(content)
    if (cardCount > 2) {
      warn(viewRel, `Uses ${cardCount} hand-written card/panel/section classes — prefer InputOutputPanel and standard layout components`)
    }
  }

  // ── Allowlist report ────────────────────────────────────────────────
  if (isAllowlisted) {
    const reason = CUSTOM_LAYOUT_ALLOWLIST.get(pluginId)
    console.log(`  ℹ️  ${viewRel}: allowlisted — ${reason}`)
  }
}

function findViewForPlugin(componentPath) {
  if (!componentPath) return null
  const resolved = resolveAtAlias(componentPath)
  if (existsSync(resolved)) return resolved
  return null
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log('🔍 validate-tool-layout — Tool Page Layout Compliance Check\n')

// Step 1: Parse barrel to get active plugins
const barrelPath = join(PLUGINS_DIR, 'index.ts')
const activePlugins = parseBarrelExports(barrelPath)

console.log(`📦 Active plugins (from barrel): ${activePlugins.length}`)
console.log(`   ${activePlugins.map(p => p.exportName).join(', ')}`)

// Step 2: For each active plugin, find its view and validate
let checkedViews = 0
let missingViews = 0

for (const { exportName, pluginFile } of activePlugins) {
  const pluginPath = join(PLUGINS_DIR, pluginFile)
  const pluginContent = readFileIfExists(pluginPath)

  if (!pluginContent) {
    console.log(`  ⚠️  Plugin file not found: ${pluginFile}`)
    continue
  }

  const pluginId = extractPluginId(pluginContent)
  const componentPath = extractComponentPath(pluginContent)
  const pluginStatus = extractPluginStatus(pluginContent)
  const pluginCategory = extractPluginCategory(pluginContent)

  if (pluginStatus !== 'active') {
    console.log(`  ⏭️  ${pluginId || exportName}: status="${pluginStatus}" — skipping layout check`)
    continue
  }

  const viewPath = findViewForPlugin(componentPath)
  if (!viewPath) {
    error(`src/plugins/${pluginFile}`, `Active plugin "${pluginId || exportName}" references missing view: ${componentPath}`)
    missingViews++
    continue
  }

  validateView(viewPath, pluginId || exportName, pluginCategory)
  checkedViews++

  // Track missing plugin specs (summary only — detailed check via validate:plugin-specs)
  const specCheckId = pluginId || exportName
  if (!hasPluginSpec(specCheckId) && !SPEC_EXEMPT.has(specCheckId)) {
    missingSpecs.push(specCheckId)
  }
}

// Step 3: Also scan for coming-soon plugins (just count them)
const allPluginFiles = existsSync(PLUGINS_DIR)
  ? readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.plugin.ts'))
  : []
const nonActiveCount = allPluginFiles.length - activePlugins.length

// ── Output ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`)

// Print errors
if (errorList.length > 0) {
  console.log(`\n❌ Errors (${errorList.length}):\n`)
  for (const e of errorList) {
    console.log(`  ${e.file}`)
    console.log(`     ${e.message}`)
    console.log()
  }
}

// Print warnings
if (warningList.length > 0) {
  console.log(`⚠️  Warnings (${warningList.length}):\n`)
  for (const w of warningList) {
    console.log(`  ${w.file}`)
    console.log(`     ${w.message}`)
    console.log()
  }
}

// Print allowlist info
if (CUSTOM_LAYOUT_ALLOWLIST.size > 0) {
  console.log(`📋 Custom Layout Allowlist (${CUSTOM_LAYOUT_ALLOWLIST.size}):\n`)
  for (const [id, reason] of CUSTOM_LAYOUT_ALLOWLIST) {
    console.log(`  ${id}: ${reason}`)
  }
  console.log()
}

// ── Summary ───────────────────────────────────────────────────────────────

const totalPlugins = allPluginFiles.length

console.log(`${'─'.repeat(60)}`)
console.log(`\n📊 Summary:`)
console.log(`   Total plugin files:       ${totalPlugins}`)
console.log(`   Active plugins (barrel):   ${activePlugins.length}`)
console.log(`   Coming-soon / inactive:    ${nonActiveCount}`)
console.log(`   Checked views:             ${checkedViews}`)
console.log(`   Errors:                    ${errors}`)
console.log(`   Warnings:                  ${warnings}`)
if (missingSpecs.length > 0) {
  console.log(`   Missing plugin-specs:      ${missingSpecs.length} — run: npm run validate:plugin-specs`)
}

if (errors === 0 && warnings === 0) {
  console.log(`\n✅ PASS — All active tool views comply with layout requirements.`)
} else if (errors === 0) {
  console.log(`\n✅ PASS — Tool layout validation passed (with ${warnings} warning(s)).`)
} else {
  console.log(`\n❌ FAIL — ${errors} layout violation(s) must be fixed.`)
}

console.log()

// ── Exit ──────────────────────────────────────────────────────────────────

process.exit(errors > 0 ? 1 : 0)
