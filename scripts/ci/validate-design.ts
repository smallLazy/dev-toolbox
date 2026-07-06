#!/usr/bin/env npx tsx
/**
 * Design Validation — Quality Gate
 *
 * Enforces token-only styling and the Phase 1 ToolLayout migration guard.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DEFAULT_ROOT = path.resolve(__dirname, '..', '..')
const THEME_REL_PATH = path.join('src', 'assets', 'theme.css')

export type DesignSeverity = 'error' | 'warning'

export interface DesignFinding {
  file: string
  line: number
  rule: string
  severity: DesignSeverity
  message: string
}

export interface DesignValidationResult {
  findings: DesignFinding[]
  errors: DesignFinding[]
  warnings: DesignFinding[]
}

const LEGACY_FEATURE_LAYOUT_ALLOWLIST = new Set([
  'src/features/agent/AgentView.vue',
  'src/features/color/ColorView.vue',
  'src/features/curl/CurlView.vue',
  'src/features/diff/DiffView.vue',
  'src/features/explain/ExplainView.vue',
  'src/features/gitee/GiteeView.vue',
  'src/features/github/GithubView.vue',
  'src/features/graphql/GraphqlView.vue',
  'src/features/hello/HelloView.vue',
  'src/features/http-client/HttpClientView.vue',
  'src/features/jira/JiraView.vue',
  'src/features/jwt/JwtView.vue',
  'src/features/prompt/PromptView.vue',
  'src/features/qrcode/QrcodeView.vue',
  'src/features/request-decoder/RequestDecoderView.vue',
  'src/features/review/ReviewView.vue',
  'src/features/rsa/RsaView.vue',
  'src/features/sentry/SentryView.vue',
  'src/features/sm2/Sm2View.vue',
  'src/features/sm3/Sm3View.vue',
  'src/features/sm4/Sm4View.vue',
  'src/features/translate/TranslateView.vue',
  'src/features/websocket/WebsocketView.vue',
  'src/features/wecom/WecomView.vue',
  'src/features/zentao/ZentaoView.vue',
])

const HEX_COLOR_RE = /(?<![\w-])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
const RAW_COLOR_RE = /(?:rgba?|hsla?)\(/g
const VAR_RE = /var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,[^)]+)?\)/g
const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u
const HARDCODED_VISUAL_RE = /\b(?:padding|margin|gap|font-size|border-radius|width|height|min-height|max-width):\s*-?\d+(?:\.\d+)?px\b/g
const OLD_LAYOUT_RE = /(?:class=["'][^"']*\b(?:card|action-bar)\b|^\s*\.(?:card|action-bar)\b)/
const FEATURE_TOOL_FIELD_RE = /\.tool-field\s*\{/
const FEATURE_TOOL_FIELD_LABEL_RE = /\.tool-field-label\s*\{/
const FEATURE_FIELD_CSS_RE = /\.field\s*\{/
const FEATURE_FIELD_LABEL_CSS_RE = /\.field-label\s*\{/
const FEATURE_SEGMENTED_CONTROL_CSS_RE = /\.segmented-control\s*\{/
const SEGMENTED_CONTROL_PATH = 'src/templates/ToolSegmentedControl.vue'

function normalizeRel(filePath: string): string {
  return filePath.split(path.sep).join('/')
}

function isSkipped(relPath: string): boolean {
  return (
    relPath === 'scripts/ci/validate-design.ts' ||
    relPath.includes('node_modules') ||
    relPath.includes('/dist/') ||
    relPath.includes('/target/') ||
    relPath.includes('__tests__') ||
    !/\.(vue|css|ts)$/.test(relPath)
  )
}

function isComment(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')
}

function isThemeFile(relPath: string): boolean {
  return relPath === THEME_REL_PATH
}

function collectDefinedTokens(root: string): Set<string> {
  const themePath = path.join(root, THEME_REL_PATH)
  const tokens = new Set<string>()
  if (!fs.existsSync(themePath)) return tokens

  const content = fs.readFileSync(themePath, 'utf-8')
  const tokenDefRe = /^\s*(--[A-Za-z0-9_-]+)\s*:/gm
  for (const match of content.matchAll(tokenDefRe)) {
    tokens.add(match[1]!)
  }
  return tokens
}

function pushFinding(
  findings: DesignFinding[],
  file: string,
  line: number,
  rule: string,
  severity: DesignSeverity,
  message: string,
): void {
  findings.push({ file, line, rule, severity, message })
}

function checkFile(filePath: string, relPath: string, tokens: Set<string>, findings: DesignFinding[]): void {
  if (isSkipped(relPath)) return

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const themeFile = isThemeFile(relPath)
  const legacyFeatureLayout = LEGACY_FEATURE_LAYOUT_ALLOWLIST.has(relPath)
  let hasFieldCss = false
  let hasFieldLabelCss = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    if (isComment(line) || line.includes('@ts-nocheck')) continue

    for (const match of line.matchAll(VAR_RE)) {
      const token = match[1]!
      if (!tokens.has(token)) {
        pushFinding(findings, relPath, lineNum, 'DESIGN-007', 'error', `Unknown design token ${token}. Define it in ${THEME_REL_PATH} or use an existing token.`)
      }
    }

    if (/transition\s*:\s*all\b/.test(line)) {
      pushFinding(findings, relPath, lineNum, 'DESIGN-008', 'error', 'transition: all is forbidden. List transitioned properties explicitly.')
    }

    if (relPath.startsWith('src/features/') && relPath.endsWith('.vue') && OLD_LAYOUT_RE.test(line)) {
      pushFinding(
        findings,
        relPath,
        lineNum,
        'DESIGN-009',
        legacyFeatureLayout ? 'warning' : 'error',
        legacyFeatureLayout
          ? 'Legacy feature still uses .card/.action-bar. Keep as-is until migrated.'
          : 'Feature pages must use ToolLayout/ToolWorkspace instead of direct .card/.action-bar layout classes.',
      )
    }

    if (!themeFile && !line.includes('data:') && (HEX_COLOR_RE.test(line) || RAW_COLOR_RE.test(line))) {
      pushFinding(findings, relPath, lineNum, 'DESIGN-010', 'error', 'Hardcoded color found. Add or use a design token instead.')
    }
    HEX_COLOR_RE.lastIndex = 0
    RAW_COLOR_RE.lastIndex = 0

    if (/\.(vue|ts)$/.test(relPath) && /icon\s*:/.test(line) && EMOJI_RE.test(line)) {
      pushFinding(findings, relPath, lineNum, 'DESIGN-011', 'error', 'Emoji icon found. Use an icon key from @/design/icons.')
    }

    for (const match of line.matchAll(HARDCODED_VISUAL_RE)) {
      const value = match[0]
      if (themeFile || value.includes('1px') || value.includes('2px')) continue
      pushFinding(findings, relPath, lineNum, 'DESIGN-012', 'warning', `Hardcoded visual value: ${value}. Prefer design tokens.`)
    }

    // DESIGN-013 — Feature pages must use ToolOptionGroup, not duplicate .tool-field/.tool-field-label
    if (relPath.startsWith('src/features/') && relPath.endsWith('.vue')) {
      if (FEATURE_TOOL_FIELD_RE.test(line) && !legacyFeatureLayout) {
        pushFinding(findings, relPath, lineNum, 'DESIGN-013', 'error',
          'Feature page defines .tool-field. Use ToolOptionGroup from @/templates/ToolOptionGroup.vue instead.')
      }
      if (FEATURE_TOOL_FIELD_LABEL_RE.test(line) && !legacyFeatureLayout) {
        pushFinding(findings, relPath, lineNum, 'DESIGN-013', 'error',
          'Feature page defines .tool-field-label. Use ToolOptionGroup from @/templates/ToolOptionGroup.vue instead.')
      }

      // DESIGN-016 — Feature pages must not define .segmented-control CSS (use ToolSegmentedControl)
      if (FEATURE_SEGMENTED_CONTROL_CSS_RE.test(line) && !legacyFeatureLayout) {
        pushFinding(findings, relPath, lineNum, 'DESIGN-016', 'error',
          'Feature page defines .segmented-control CSS. Use ToolSegmentedControl from @/templates/ToolSegmentedControl.vue instead.')
      }

      // DESIGN-017 — Track .field / .field-label co-occurrence
      if (FEATURE_FIELD_CSS_RE.test(line) && !legacyFeatureLayout) hasFieldCss = true
      if (FEATURE_FIELD_LABEL_CSS_RE.test(line) && !legacyFeatureLayout) hasFieldLabelCss = true
    }
  }

  // DESIGN-017 — Feature pages must not define both .field and .field-label (use ToolOptionGroup)
  if (hasFieldCss && hasFieldLabelCss && !legacyFeatureLayout) {
    pushFinding(findings, relPath, 1, 'DESIGN-017', 'error',
      'Feature page defines .field + .field-label CSS combination. Use ToolOptionGroup from @/templates/ToolOptionGroup.vue instead.')
  }

  // DESIGN-014 / DESIGN-015 — ToolSegmentedControl must enforce nowrap and inline-flex
  if (relPath === SEGMENTED_CONTROL_PATH) {
    checkSegmentedControl(content, relPath, findings)
  }
}

function checkSegmentedControl(content: string, relPath: string, findings: DesignFinding[]): void {
  const lines = content.split('\n')
  let inButtonBlock = false
  let inControlBlock = false
  let buttonHasNowrap = false
  let controlDisplayIsInlineFlex = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    if (isComment(line)) continue

    // Track which CSS block we're inside (very basic — just checks for selector lines)
    if (/\.segmented-control\s*\{/.test(line)) {
      inControlBlock = true
      inButtonBlock = false
    } else if (/\.segmented-control\s+button\s*[,{]/.test(line) || /\.segmented-control\s+button\s*\{/.test(line)) {
      inButtonBlock = true
      inControlBlock = false
    } else if (line.trim() === '}') {
      inControlBlock = false
      inButtonBlock = false
    }

    // DESIGN-014: button block must include white-space: nowrap
    if (inButtonBlock && /\bwhite-space\s*:\s*nowrap\b/.test(line)) {
      buttonHasNowrap = true
    }

    // DESIGN-015: .segmented-control block must use display: inline-flex (not display: flex)
    if (inControlBlock && /\bdisplay\s*:\s*inline-flex\b/.test(line)) {
      controlDisplayIsInlineFlex = true
    }
    if (inControlBlock && /\bdisplay\s*:\s*flex\s*;/.test(line) && !/\binline-flex\b/.test(line)) {
      pushFinding(findings, relPath, lineNum, 'DESIGN-015', 'error',
        'ToolSegmentedControl .segmented-control must use display: inline-flex, not display: flex (block). Block-level flex stretches the control to fill its parent, causing layout instability.')
    }
  }

  if (!buttonHasNowrap) {
    pushFinding(findings, relPath, 1, 'DESIGN-014', 'error',
      'ToolSegmentedControl .segmented-control button must include white-space: nowrap to prevent text wrapping (e.g. "Code Point" wrapping to two lines).')
  }

  if (!controlDisplayIsInlineFlex) {
    pushFinding(findings, relPath, 1, 'DESIGN-015', 'error',
      'ToolSegmentedControl .segmented-control must use display: inline-flex so it sizes to content rather than stretching to fill the parent.')
  }
}

function walk(dir: string, root: string, tokens: Set<string>, findings: DesignFinding[]): void {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'target'].includes(entry.name)) {
        walk(fullPath, root, tokens, findings)
      }
    } else if (entry.isFile()) {
      checkFile(fullPath, normalizeRel(path.relative(root, fullPath)), tokens, findings)
    }
  }
}

export function validateDesign(root = DEFAULT_ROOT): DesignValidationResult {
  const tokens = collectDefinedTokens(root)
  const findings: DesignFinding[] = []
  walk(path.join(root, 'src'), root, tokens, findings)
  walk(path.join(root, 'scripts'), root, tokens, findings)

  const errors = findings.filter(f => f.severity === 'error')
  const warnings = findings.filter(f => f.severity === 'warning')
  return { findings, errors, warnings }
}

function main(): void {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Design Validation                     ║')
  console.log('╚══════════════════════════════════════════╝\n')

  const result = validateDesign(DEFAULT_ROOT)

  if (result.errors.length === 0) {
    if (result.warnings.length > 0) {
      console.log(`Warnings: ${result.warnings.length}`)
      for (const warning of result.warnings.slice(0, 20)) {
        console.log(`  [${warning.rule}] ${warning.file}:${warning.line}`)
        console.log(`    ${warning.message}`)
      }
      if (result.warnings.length > 20) {
        console.log(`  ...and ${result.warnings.length - 20} more warning(s).`)
      }
      console.log('')
    }
    console.log('✅ Design validation passed.\n')
    process.exit(0)
  }

  console.log(`❌ ${result.errors.length} design error(s):\n`)
  for (const finding of result.errors) {
    console.log(`  [${finding.rule}] ${finding.file}:${finding.line}`)
    console.log(`    ${finding.message}\n`)
  }
  process.exit(1)
}

if (process.argv[1] && normalizeRel(process.argv[1]).endsWith('scripts/ci/validate-design.ts')) {
  main()
}
