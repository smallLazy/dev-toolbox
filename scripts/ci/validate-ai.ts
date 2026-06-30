#!/usr/bin/env npx tsx
/**
 * AI Governance Validation — Quality Gate
 *
 * Checks:
 *   1. AGENTS.md exists at repo root
 *   2. CLAUDE.md exists at repo root
 *   3. docs/ai/ directory is complete (all required files)
 *   4. All referenced documents in AGENTS.md exist (no broken links)
 *   5. No duplicate specs between AGENTS.md and existing docs
 *   6. AGENTS.md does not duplicate content from SSOT docs
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')

interface AIViolation {
  file: string
  line: number
  rule: string
  message: string
}

const violations: AIViolation[] = []

// ── Required Files ─────────────────────────────────────────────────────

const REQUIRED_ROOT_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
]

const REQUIRED_AI_DOCS = [
  'AI_OVERVIEW.md',
  'AI_ARCHITECTURE.md',
  'AI_PLUGIN_GUIDE.md',
  'AI_UI_GUIDE.md',
  'AI_CODE_REVIEW.md',
  'AI_RELEASE.md',
  'AI_CONTEXT_GRAPH.md',
  'AI_PROMPT_CONVENTION.md',
  'AI_DECISIONS.md',
]

/**
 * Documents referenced in AGENTS.md that must exist.
 */
const REFERENCED_DOCS = [
  'docs/ai/AI_OVERVIEW.md',
  'docs/platform/platform-freeze-v1.md',
  'docs/ai/AI_ARCHITECTURE.md',
  'docs/architecture/workspace-architecture-v1.md',
  'docs/design/design-system-v2.md',
  'docs/design/ui-guidelines-v1.md',
  'docs/design/icon-guidelines-v1.md',
  'docs/design/interaction-guidelines-v1.md',
  'docs/sdk/feature-sdk-v1.md',
  'docs/sdk/plugin-sdk-v1.md',
  'docs/plugin/plugin-generator.md',
  'docs/ai/AI_PLUGIN_GUIDE.md',
  'docs/product/plugin-definition-of-done-v1.md',
  'docs/ai/AI_CODE_REVIEW.md',
  'docs/ai/AI_RELEASE.md',
  'docs/ai/AI_CONTEXT_GRAPH.md',
  'docs/ai/AI_DECISIONS.md',
  'docs/ai/AI_PROMPT_CONVENTION.md',
]

// ── Check: Required files exist ────────────────────────────────────────

function checkRequiredFiles(): void {
  for (const file of REQUIRED_ROOT_FILES) {
    const filePath = path.join(ROOT, file)
    if (!fs.existsSync(filePath)) {
      violations.push({
        file: file,
        line: 0,
        rule: 'AI-001',
        message: `Required AI governance file missing: ${file}. Create it at repo root.`,
      })
    }
  }

  for (const file of REQUIRED_AI_DOCS) {
    const filePath = path.join(ROOT, 'docs', 'ai', file)
    if (!fs.existsSync(filePath)) {
      violations.push({
        file: `docs/ai/${file}`,
        line: 0,
        rule: 'AI-002',
        message: `Required AI documentation file missing: docs/ai/${file}. Create it.`,
      })
    }
  }
}

// ── Check: Referenced documents exist ──────────────────────────────────

function checkReferencedDocs(): void {
  for (const ref of REFERENCED_DOCS) {
    const filePath = path.join(ROOT, ref)
    if (!fs.existsSync(filePath)) {
      violations.push({
        file: 'AGENTS.md',
        line: 0,
        rule: 'AI-003',
        message: `Broken reference: "${ref}" does not exist. Update AGENTS.md or create the missing file.`,
      })
    }
  }
}

// ── Check: AGENTS.md doesn't duplicate SSOT content ────────────────────

/**
 * SSOT documents that own specific content domains.
 * AGENTS.md should reference these, not duplicate their content.
 */
const SSOT_GUARDS: { doc: string; guardPhrases: string[] }[] = [
  {
    doc: 'docs/design/design-system-v2.md',
    guardPhrases: [
      '--gray-0:',
      '--accent-primary:',
      '--text-caption',
      '--space-1:',
      '--radius-sm',
      '--duration-instant',
      '--ease-standard',
      'var(--gray-',
      'Button\n',
      '2.1 Button\n',
      'Sidebar\n',
      '### Color Tokens',
      '### Neutral Scale',
      '### Typography',
      '### Spacing',
    ],
  },
  {
    doc: 'docs/architecture/workspace-architecture-v1.md',
    guardPhrases: [
      'BaseFeature\n',
      'FeatureContext\n',
      'ToolRegistry\n',
      'ClipboardService\n',
      '### Layer Responsibilities',
      '## 4. Registry',
      '## 5. Service Layer',
    ],
  },
  {
    doc: 'docs/sdk/feature-sdk-v1.md',
    guardPhrases: [
      'abstract class BaseFeature',
      'interface FeatureContext {',
      'interface FeatureClipboard',
      'interface FeatureHistory',
    ],
  },
  {
    doc: 'docs/sdk/plugin-sdk-v1.md',
    guardPhrases: [
      'interface PluginDefinition',
      'interface PluginInstance',
      'interface PluginContext',
      'function definePlugin',
      'function createCommand',
    ],
  },
]

function checkNoDuplication(): void {
  const agentsPath = path.join(ROOT, 'AGENTS.md')
  if (!fs.existsSync(agentsPath)) return

  const content = fs.readFileSync(agentsPath, 'utf-8')
  const lines = content.split('\n')

  for (const guard of SSOT_GUARDS) {
    for (const phrase of guard.guardPhrases) {
      const foundLines: number[] = []
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(phrase)) {
          foundLines.push(i + 1)
        }
      }
      if (foundLines.length > 0) {
        for (const line of foundLines) {
          // Skip if it's a reference / link line
          if (lines[line - 1].includes('docs/') || lines[line - 1].includes('`docs/')) continue
          if (lines[line - 1].trim().startsWith('|') && lines[line - 1].includes('docs/')) continue

          violations.push({
            file: 'AGENTS.md',
            line: line,
            rule: 'AI-004',
            message: `Potential SSOT duplication: "${phrase.trim()}" belongs in ${guard.doc}. AGENTS.md should reference, not duplicate.`,
          })
        }
      }
    }
  }

  // Deduplicate AI-004 violations (one phrase may match on multiple lines)
  const seen = new Set<string>()
  const deduped: AIViolation[] = []
  for (const v of violations) {
    if (v.rule !== 'AI-004') {
      deduped.push(v)
      continue
    }
    const key = `${v.rule}:${v.message}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(v)
    }
  }
  violations.length = 0
  violations.push(...deduped)
}

// ── Check: docs/ai/ files don't duplicate SSOT content ─────────────────

function checkAIDocsNoDuplication(): void {
  const aiDir = path.join(ROOT, 'docs', 'ai')
  if (!fs.existsSync(aiDir)) return

  const aiFiles = fs.readdirSync(aiDir).filter(f => f.endsWith('.md'))

  // Check each AI doc for content that should only be in SSOT
  for (const file of aiFiles) {
    const filePath = path.join(aiDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // Check for hardcoded design values (should only exist in design-system-v2.md)
    if (file !== 'AI_UI_GUIDE.md') {
      // Only AI_UI_GUIDE.md may reference specific tokens for quick-reference purposes
      const hardTokenPatterns = [
        /^--gray-\d+:.*#[0-9a-fA-F]{6}/,
        /^--accent-\w+:.*#[0-9a-fA-F]{6}/,
        /^--text-\w+:.*\d+px/,
        /^--space-\d+:.*\d+px/,
      ]
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of hardTokenPatterns) {
          if (pattern.test(lines[i])) {
            violations.push({
              file: `docs/ai/${file}`,
              line: i + 1,
              rule: 'AI-005',
              message: `Design Token definition found in AI doc. Tokens belong only in docs/design/design-system-v2.md. Reference, don't duplicate.`,
            })
          }
        }
      }
    }

    // Check for SDK API duplication
    if (file !== 'AI_PLUGIN_GUIDE.md') {
      const sdkPatterns = [
        'abstract class BaseFeature',
        'interface FeatureContext {',
        'interface PluginDefinition',
        'function definePlugin',
      ]
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of sdkPatterns) {
          if (lines[i].includes(pattern)) {
            violations.push({
              file: `docs/ai/${file}`,
              line: i + 1,
              rule: 'AI-005',
              message: `SDK API definition found in AI doc. API belongs in docs/sdk/. Reference, don't duplicate.`,
            })
          }
        }
      }
    }
  }
}

// ── Check: AGENTS.md line count ─────────────────────────────────────────

function checkAgentsMdLength(): void {
  const agentsPath = path.join(ROOT, 'AGENTS.md')
  if (!fs.existsSync(agentsPath)) return

  const content = fs.readFileSync(agentsPath, 'utf-8')
  const lines = content.split('\n').length

  if (lines < 100) {
    violations.push({
      file: 'AGENTS.md',
      line: 0,
      rule: 'AI-006',
      message: `AGENTS.md is too short (${lines} lines). Should be ~200-300 lines for comprehensive AI guidance.`,
    })
  }

  if (lines > 400) {
    violations.push({
      file: 'AGENTS.md',
      line: 0,
      rule: 'AI-006',
      message: `AGENTS.md is too long (${lines} lines). Should be ~200-300 lines. Move detailed content to docs/ai/.`,
    })
  }
}

// ── Check: docs/ai/ files reference SSOT docs ──────────────────────────

function checkAIDocsReferenceSSOT(): void {
  const aiDir = path.join(ROOT, 'docs', 'ai')
  if (!fs.existsSync(aiDir)) return

  // Files that should reference specific SSOT docs
  const mustReference: Record<string, string[]> = {
    'AI_ARCHITECTURE.md': [
      'workspace-architecture-v1.md',
      'platform-freeze-v1.md',
    ],
    'AI_PLUGIN_GUIDE.md': [
      'plugin-sdk-v1.md',
      'feature-sdk-v1.md',
      'plugin-generator.md',
      'plugin-definition-of-done-v1.md',
    ],
    'AI_UI_GUIDE.md': [
      'design-system-v2.md',
      'icon-guidelines-v1.md',
      'ui-guidelines-v1.md',
      'interaction-guidelines-v1.md',
    ],
    'AI_CODE_REVIEW.md': [
      'plugin-definition-of-done-v1.md',
    ],
    'AI_RELEASE.md': [
      'release-engineering-v1.md',
    ],
  }

  for (const [file, refs] of Object.entries(mustReference)) {
    const filePath = path.join(aiDir, file)
    if (!fs.existsSync(filePath)) continue

    const content = fs.readFileSync(filePath, 'utf-8')
    for (const ref of refs) {
      if (!content.includes(ref)) {
        violations.push({
          file: `docs/ai/${file}`,
          line: 0,
          rule: 'AI-007',
          message: `Missing reference to SSOT doc: "${ref}". AI docs must link to authoritative sources.`,
        })
      }
    }
  }
}

// ── Check: CLAUDE.md doesn't duplicate AGENTS.md ───────────────────────

function checkClaudeNotDuplicateAgents(): void {
  const claudePath = path.join(ROOT, 'CLAUDE.md')
  const agentsPath = path.join(ROOT, 'AGENTS.md')

  if (!fs.existsSync(claudePath) || !fs.existsSync(agentsPath)) return

  const claudeContent = fs.readFileSync(claudePath, 'utf-8')
  const claudeLines = claudeContent.split('\n')
  const agentsContent = fs.readFileSync(agentsPath, 'utf-8')

  // CLAUDE.md should be Claude-specific (checklist, commands, behaviors)
  // It should NOT duplicate the full architecture explanation
  const suspiciousPatterns = [
    '### Plugin Architecture (8 Layers',
    '### Frozen Layers',
    '## 2. Architecture Overview',
    '## 4. Required Reading',
    '### Dependency Rules\n',
  ]

  for (const pattern of suspiciousPatterns) {
    if (claudeContent.includes(pattern)) {
      for (let i = 0; i < claudeLines.length; i++) {
        if (claudeLines[i].includes(pattern.trim())) {
          violations.push({
            file: 'CLAUDE.md',
            line: i + 1,
            rule: 'AI-008',
            message: `CLAUDE.md duplicates AGENTS.md content: "${pattern.trim()}". CLAUDE.md should be Claude-specific (checklist, commands, behaviors), not a duplicate of AGENTS.md.`,
          })
        }
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────

function main(): void {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   AI Governance Validation              ║')
  console.log('╚══════════════════════════════════════════╝\n')

  checkRequiredFiles()
  checkReferencedDocs()
  checkNoDuplication()
  checkAIDocsNoDuplication()
  checkAgentsMdLength()
  checkAIDocsReferenceSSOT()
  checkClaudeNotDuplicateAgents()

  if (violations.length === 0) {
    console.log('✅ AI Governance is compliant.\n')
    console.log('   AGENTS.md:       ✅')
    console.log('   CLAUDE.md:       ✅')
    console.log('   docs/ai/:         ✅ Complete')
    console.log('   References:       ✅ All valid')
    console.log('   No Duplication:   ✅ Clean')
    console.log('   SSOT Compliance:  ✅ All refs point to authoritative docs\n')
    process.exit(0)
  }

  console.log(`❌ ${violations.length} AI Governance violation(s):\n`)

  // Group by rule
  const grouped: Record<string, AIViolation[]> = {}
  for (const v of violations) {
    if (!grouped[v.rule]) grouped[v.rule] = []
    grouped[v.rule].push(v)
  }

  for (const [rule, items] of Object.entries(grouped)) {
    console.log(`  [${rule}] ${items.length} violation(s):`)
    for (const item of items.slice(0, 5)) {
      const loc = item.line > 0 ? `${item.file}:${item.line}` : item.file
      console.log(`    ${loc}`)
      console.log(`      ${item.message}\n`)
    }
    if (items.length > 5) {
      console.log(`    ... and ${items.length - 5} more\n`)
    }
  }

  process.exit(1)
}

main()
