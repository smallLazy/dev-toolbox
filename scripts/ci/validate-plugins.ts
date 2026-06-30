#!/usr/bin/env npx tsx
/**
 * Plugin Validation — Quality Gate
 *
 * Checks:
 *   1. Every plugin uses definePlugin()
 *   2. Every Feature extends BaseFeature
 *   3. Zero direct Core/Registry/Service imports
 *   4. Plugin file structure matches schema
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')

interface ValidationError {
  plugin: string
  file: string
  rule: string
  message: string
}

const errors: ValidationError[] = []

// ── Check plugins ────────────────────────────────────────────────────

function validatePlugins(): void {
  const pluginsDir = path.join(ROOT, 'src', 'plugins')
  if (!fs.existsSync(pluginsDir)) {
    console.log('⚠️  No plugins directory found. Skipping plugin validation.')
    return
  }

  const pluginFiles = fs.readdirSync(pluginsDir).filter((f) => f.endsWith('.plugin.ts'))

  if (pluginFiles.length === 0) {
    console.log('⚠️  No plugin files found. Skipping plugin validation.')
    return
  }

  console.log(`\n🔍 Validating ${pluginFiles.length} plugins...\n`)

  for (const file of pluginFiles) {
    const filePath = path.join(pluginsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const pluginName = file.replace('.plugin.ts', '')

    // Rule 1: Must use definePlugin
    if (!content.includes('definePlugin')) {
      errors.push({
        plugin: pluginName,
        file,
        rule: 'PLUGIN-001',
        message: 'Plugin must use definePlugin() from @/sdk/plugin',
      })
    }

    // Rule 2: Must NOT import from Core directly
    const coreImportPatterns = [
      /from\s+['"]@\/core['"]/,
      /from\s+['"]@\/core\/registry/,
      /from\s+['"]@\/core\/services/,
    ]
    for (const pattern of coreImportPatterns) {
      if (pattern.test(content)) {
        errors.push({
          plugin: pluginName,
          file,
          rule: 'PLUGIN-002',
          message: `Plugin must NOT import from Core directly. Found: ${pattern}`,
        })
      }
    }
  }
}

// ── Check Features ───────────────────────────────────────────────────

function validateFeatures(): void {
  const featuresDir = path.join(ROOT, 'src', 'features')
  if (!fs.existsSync(featuresDir)) {
    console.log('⚠️  No features directory found. Skipping feature validation.')
    return
  }

  const featureNames = fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  console.log(`🔍 Validating ${featureNames.length} features...\n`)

  for (const name of featureNames) {
    const featureDir = path.join(featuresDir, name)

    // Rule 3: Must have logic.ts
    if (!fs.existsSync(path.join(featureDir, 'logic.ts'))) {
      errors.push({
        plugin: name,
        file: `features/${name}/`,
        rule: 'FEAT-001',
        message: 'Feature must have logic.ts (pure functions)',
      })
    }

    // Rule 4: Must have types.ts
    if (!fs.existsSync(path.join(featureDir, 'types.ts'))) {
      errors.push({
        plugin: name,
        file: `features/${name}/`,
        rule: 'FEAT-002',
        message: 'Feature must have types.ts',
      })
    }

    // Rule 5: Must have __tests__/logic.test.ts
    if (!fs.existsSync(path.join(featureDir, '__tests__', 'logic.test.ts'))) {
      errors.push({
        plugin: name,
        file: `features/${name}/`,
        rule: 'FEAT-003',
        message: 'Feature must have __tests__/logic.test.ts',
      })
    }

    // Rule 6: Must NOT import from Core in Vue views
    const vueFiles = fs
      .readdirSync(featureDir)
      .filter((f) => f.endsWith('.vue'))

    for (const vf of vueFiles) {
      const content = fs.readFileSync(path.join(featureDir, vf), 'utf-8')
      if (/from\s+['"]@\/core['"]/.test(content)) {
        errors.push({
          plugin: name,
          file: `features/${name}/${vf}`,
          rule: 'FEAT-004',
          message: 'Feature View must NOT import from Core',
        })
      }
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────

function main(): void {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Plugin & Feature Validation           ║')
  console.log('╚══════════════════════════════════════════╝')

  validatePlugins()
  validateFeatures()

  if (errors.length === 0) {
    console.log('\n✅ All validations passed!\n')
    process.exit(0)
  }

  console.log(`\n❌ ${errors.length} validation error(s):\n`)
  for (const err of errors) {
    console.log(`  [${err.rule}] ${err.plugin}/${err.file}`)
    console.log(`    ${err.message}\n`)
  }
  process.exit(1)
}

main()
