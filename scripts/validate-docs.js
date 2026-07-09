#!/usr/bin/env node

/**
 * validate-docs.js — Documentation Governance Check
 *
 * Validates:
 *   1. docs/DOCS_INDEX.md exists
 *   2. All docs/*.md files have valid front matter with status
 *   3. Status is one of: active | deprecated | archive | snapshot
 *   4. Deprecated docs have replaced_by or reason
 *   5. Active docs don't reference docs/archive/ directly
 *   6. DOCS_INDEX.md entries match actual files on disk
 *
 * Exit code: 0 = pass, 1 = violations found
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, basename, dirname } from 'path'

// Config
const DOCS_DIR = join(import.meta.dirname, '..', 'docs')
const ROOT_DIR = join(import.meta.dirname, '..')
const VALID_STATUSES = new Set(['active', 'deprecated', 'archive', 'snapshot'])
const EXEMPT_FILES = new Set(['README.md', 'README.zh-CN.md'])

// Root-level markdown files (not in docs/) are exempt from status checks
const EXEMPT_DIRS = new Set([])

let errors = 0
let warnings = 0

function error(file, msg) {
  console.error(`  ❌ ${file}: ${msg}`)
  errors++
}

function warn(file, msg) {
  console.warn(`  ⚠️  ${file}: ${msg}`)
  warnings++
}

function ok(file, msg) {
  console.log(`  ✅ ${file}: ${msg}`)
}

// --- Parse front matter ---
function parseFrontMatter(content) {
  if (!content.startsWith('---')) return null
  const end = content.indexOf('---', 3)
  if (end === -1) return null
  const fmBlock = content.substring(3, end).trim()
  const fm = {}
  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.substring(0, colonIdx).trim()
    const value = line.substring(colonIdx + 1).trim()
    fm[key] = value
  }
  return fm
}

// --- Walk directory ---
function walkDir(dir) {
  const results = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full))
    } else if (entry.endsWith('.md')) {
      results.push(full)
    }
  }
  return results
}

// --- Find all markdown files (docs + root READMEs) ---
function findAllMdFiles() {
  const docsMd = walkDir(DOCS_DIR)
  // Root-level markdown files (READMEs, AGENTS, CLAUDE, CHANGELOG)
  const rootFiles = []
  for (const name of ['README.md', 'README.zh-CN.md', 'AGENTS.md', 'CLAUDE.md', 'CHANGELOG.md']) {
    const p = join(ROOT_DIR, name)
    if (existsSync(p)) rootFiles.push(p)
  }
  return { docsMd, rootFiles }
}

// --- Check 1: DOCS_INDEX exists ---
function checkDocsIndexExists() {
  console.log('\n📋 Check 1: DOCS_INDEX.md existence')
  const indexPath = join(DOCS_DIR, 'DOCS_INDEX.md')
  if (!existsSync(indexPath)) {
    error('docs/DOCS_INDEX.md', 'DOCS_INDEX.md must exist as the documentation SSOT')
    return false
  }
  ok('docs/DOCS_INDEX.md', 'exists')
  return true
}

// --- Check 2: All docs have valid front matter with status ---
function checkFrontMatter(files) {
  console.log('\n📋 Check 2: Front matter status validation')
  let allValid = true

  for (const file of files) {
    const relPath = relative(ROOT_DIR, file)
    const fileName = basename(file)

    // Skip root-level non-docs files
    if (!relPath.startsWith('docs/')) {
      // Only check DOCS_INDEX, skip README/AGENTS/CLAUDE/CHANGELOG
      continue
    }

    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)

    if (!fm) {
      error(relPath, 'Missing front matter (must have at least status, last_reviewed, owner)')
      allValid = false
      continue
    }

    // Check required fields
    if (!fm.status) {
      error(relPath, 'Front matter missing required field: status')
      allValid = false
      continue
    }

    if (!fm.last_reviewed) {
      warn(relPath, 'Front matter missing last_reviewed date')
    }

    if (!fm.owner) {
      warn(relPath, 'Front matter missing owner')
    }

    // Validate status value
    if (!VALID_STATUSES.has(fm.status)) {
      error(relPath, `Invalid status "${fm.status}" — must be one of: ${[...VALID_STATUSES].join(', ')}`)
      allValid = false
    }
  }

  if (allValid) {
    ok('All docs/', 'valid front matter with recognized status')
  }
  return allValid
}

// --- Check 3: Deprecated docs have replaced_by or reason ---
function checkDeprecatedDocs(files) {
  console.log('\n📋 Check 3: Deprecated doc requirements')
  let allValid = true

  for (const file of files) {
    const relPath = relative(ROOT_DIR, file)
    if (!relPath.startsWith('docs/')) continue

    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)
    if (!fm || fm.status !== 'deprecated') continue

    if (!fm.replaced_by && !fm.reason) {
      error(relPath, 'Deprecated doc must have either "replaced_by" or "reason" in front matter')
      allValid = false
    } else {
      ok(relPath, `deprecated — ${fm.replaced_by ? `replaced_by: ${fm.replaced_by}` : `reason: ${fm.reason}`}`)
    }
  }

  if (allValid && !files.some(f => {
    const fm = parseFrontMatter(readFileSync(f, 'utf-8'))
    return fm && fm.status === 'deprecated'
  })) {
    console.log('  ✅ No deprecated docs found')
  }
  return allValid
}

// --- Check 4: Active docs don't reference archive/ paths ---
function checkActiveDocsNoArchiveRefs(files) {
  console.log('\n📋 Check 4: Active docs must not reference archive/')
  let allValid = true

  for (const file of files) {
    const relPath = relative(ROOT_DIR, file)
    if (!relPath.startsWith('docs/')) continue

    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)
    if (!fm || fm.status !== 'active') continue

    // Check for references to docs/archive/
    const archiveRefs = []
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Match references like docs/archive/ or ./archive/ or /archive/
      if (line.match(/docs\/archive\//) || line.match(/\.\/archive\//)) {
        // Allow if the line explicitly marks it as "historical" or "reference only"
        if (line.match(/historical|reference only|仅供参考|仅供/)) {
          continue
        }
        archiveRefs.push(i + 1)
      }
    }

    if (archiveRefs.length > 0) {
      error(relPath, `Active doc references docs/archive/ at lines: ${archiveRefs.join(', ')}. ` +
        `Archive docs must not be used as current implementation reference. ` +
        `If this is intentional, add "historical reference" or "仅供参考" qualifier on the same line.`)
      allValid = false
    }
  }

  if (allValid) {
    ok('All active docs', 'no unqualified references to archive/')
  }
  return allValid
}

// --- Check 5: DOCS_INDEX.md entries match actual files ---
function checkDocsIndexVsFiles(docsFiles) {
  console.log('\n📋 Check 5: DOCS_INDEX.md ↔ file consistency')

  const indexPath = join(DOCS_DIR, 'DOCS_INDEX.md')
  if (!existsSync(indexPath)) return false

  const indexContent = readFileSync(indexPath, 'utf-8')

  // Extract file references from DOCS_INDEX.md (patterns like `docs/xxx/yyy.md` or `**xxx.md**`)
  const refPattern = /\*\*(.+?\.md)\*\*/g
  const refsInIndex = new Set()
  let match
  while ((match = refPattern.exec(indexContent)) !== null) {
    refsInIndex.add(match[1])
  }

  // Get actual files in docs/
  const actualFiles = new Set()
  for (const f of docsFiles) {
    const relPath = relative(DOCS_DIR, f)
    actualFiles.add(relPath)
  }
  // Also add DOCS_INDEX.md itself
  actualFiles.add('DOCS_INDEX.md')

  // Check: files in docs that are NOT in DOCS_INDEX
  let allValid = true
  const docsIndexPath = 'DOCS_INDEX.md'

  for (const f of actualFiles) {
    const base = basename(f)
    // Skip DOCS_INDEX itself from the check
    if (f === docsIndexPath) continue
    // Check both basename and full relative path
    const foundByName = refsInIndex.has(base) || refsInIndex.has(f)
    if (!foundByName) {
      // Also try matching against partial paths (e.g. "cloud-encrypt/cloud-encrypt-migration.md" vs "archive/cloud-encrypt/cloud-encrypt-migration.md")
      let found = false
      for (const ref of refsInIndex) {
        if (f.endsWith(ref) || ref.endsWith(f)) {
          found = true
          break
        }
      }
      if (!found) {
        warn(`docs/${f}`, 'File exists on disk but may not be listed in DOCS_INDEX.md')
      }
    }
  }

  // Check: files referenced in DOCS_INDEX that don't exist on disk
  for (const ref of refsInIndex) {
    // Construct potential paths
    let found = false
    for (const actual of actualFiles) {
      if (actual.endsWith(ref) || actual === ref) {
        found = true
        break
      }
    }
    if (!found) {
      // Check if it's a root-level reference (README.md, etc.)
      const rootPath = join(ROOT_DIR, ref)
      if (!existsSync(rootPath)) {
        warn(`DOCS_INDEX.md`, `References "${ref}" but file not found on disk`)
      }
    }
  }

  if (allValid) {
    ok('DOCS_INDEX.md', 'consistent with files on disk')
  }
  return allValid
}

// --- Check 6: Archive files exist in docs/archive/ ---
function checkArchiveFiles(files) {
  console.log('\n📋 Check 6: Archive file location')
  let allValid = true

  for (const file of files) {
    const relPath = relative(ROOT_DIR, file)
    if (!relPath.startsWith('docs/')) continue

    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)
    if (!fm || fm.status !== 'archive') continue

    if (!relPath.startsWith('docs/archive/')) {
      error(relPath, `File has status "archive" but is NOT under docs/archive/. Move it to docs/archive/.`)
      allValid = false
    } else {
      ok(relPath, 'correctly located under docs/archive/')
    }
  }

  if (allValid) {
    const archiveCount = files.filter(f => {
      const fm = parseFrontMatter(readFileSync(f, 'utf-8'))
      return fm && fm.status === 'archive'
    }).length
    if (archiveCount === 0) {
      console.log('  ✅ No archive files found')
    }
  }
  return allValid
}

// --- Check 7: Snapshot files are in releases/ or checklists/ ---
function checkSnapshotFiles(files) {
  console.log('\n📋 Check 7: Snapshot file location')
  let allValid = true

  for (const file of files) {
    const relPath = relative(ROOT_DIR, file)
    if (!relPath.startsWith('docs/')) continue

    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)
    if (!fm || fm.status !== 'snapshot') continue

    const validDirs = ['docs/releases/', 'docs/checklists/']
    const inValidDir = validDirs.some(d => relPath.startsWith(d))
    if (!inValidDir) {
      warn(relPath, `File has status "snapshot" — expected under releases/ or checklists/. Verify this is intentional.`)
    } else {
      ok(relPath, 'correctly located')
    }
  }

  return allValid
}

// --- Statistics ---
function printStatistics(files) {
  console.log('\n📊 Statistics')

  const docsFiles = files.filter(f => relative(ROOT_DIR, f).startsWith('docs/'))
  const totalDocsMd = docsFiles.length
  const rootMd = files.filter(f => !relative(ROOT_DIR, f).startsWith('docs/')).length

  console.log(`   docs/**/*.md total:       ${totalDocsMd}`)
  console.log(`   Participating in checks:  ${totalDocsMd} (all docs/.md files)`)
  console.log(`   Exempt (root-level):      ${rootMd} (${files.filter(f => !relative(ROOT_DIR, f).startsWith('docs/')).map(f => basename(f)).join(', ')})`)

  // Count by status
  const statusCounts = { active: 0, deprecated: 0, archive: 0, snapshot: 0 }
  for (const file of docsFiles) {
    const content = readFileSync(file, 'utf-8')
    const fm = parseFrontMatter(content)
    if (fm && fm.status && statusCounts.hasOwnProperty(fm.status)) {
      statusCounts[fm.status]++
    }
  }

  console.log(`   By status:`)
  console.log(`     active:     ${statusCounts.active}`)
  console.log(`     deprecated: ${statusCounts.deprecated}`)
  console.log(`     archive:    ${statusCounts.archive}`)
  console.log(`     snapshot:   ${statusCounts.snapshot}`)
  console.log(`     (total:     ${statusCounts.active + statusCounts.deprecated + statusCounts.archive + statusCounts.snapshot})`)
}

// --- Main ---
console.log('🔍 validate-docs — Documentation Governance Check')
console.log(`   Docs directory: ${relative(ROOT_DIR, DOCS_DIR)}`)

const { docsMd, rootFiles } = findAllMdFiles()
console.log(`   Files found: ${docsMd.length} in docs/, ${rootFiles.length} root-level`)

let allPassed = true

allPassed = checkDocsIndexExists() && allPassed
allPassed = checkFrontMatter(docsMd) && allPassed
allPassed = checkDeprecatedDocs(docsMd) && allPassed
allPassed = checkActiveDocsNoArchiveRefs(docsMd) && allPassed
allPassed = checkArchiveFiles(docsMd) && allPassed
allPassed = checkSnapshotFiles(docsMd) && allPassed
allPassed = checkDocsIndexVsFiles(docsMd) && allPassed

// Print statistics
printStatistics([...docsMd, ...rootFiles])

console.log('\n' + '='.repeat(60))
if (allPassed && errors === 0) {
  console.log('✅ PASS — Documentation governance check passed')
  if (warnings > 0) {
    console.log(`   (${warnings} warning${warnings !== 1 ? 's' : ''} — review but non-blocking)`)
  }
  process.exit(0)
} else {
  console.log(`❌ FAIL — ${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}`)
  process.exit(1)
}
