/**
 * Diff Plugin — Pure Logic
 *
 * Implements LCS (Longest Common Subsequence) based line-by-line diff.
 * Pure functions. Zero side effects. Directly unit-testable.
 */

import type { DiffOptions, DiffResult, DiffLine, DiffHunk, ParsedDiffLine } from './types'

// ── Normalization ────────────────────────────────────────────────────

function normalizeLine(
  line: string,
  opts: { ignoreWhitespace: boolean; ignoreCase: boolean },
): string {
  let result = line
  if (opts.ignoreCase) result = result.toLowerCase()
  if (opts.ignoreWhitespace) result = result.replace(/\s+/g, ' ').trim()
  return result
}

// ── Core diff ────────────────────────────────────────────────────────

/**
 * Compute a line-by-line diff between two texts.
 *
 * Uses O(m*n) LCS dynamic programming. Suitable for typical diff inputs
 * (hundreds to low thousands of lines). For very large inputs, the
 * validate() function enforces a 500KB per-side limit.
 */
export function computeDiff(
  left: string,
  right: string,
  options: DiffOptions,
): DiffResult {
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')

  const normalizeOpts = {
    ignoreWhitespace: options.ignoreWhitespace,
    ignoreCase: options.ignoreCase,
  }

  const leftNormalized = leftLines.map((l) => normalizeLine(l, normalizeOpts))
  const rightNormalized = rightLines.map((l) => normalizeLine(l, normalizeOpts))

  // Both empty
  if (leftLines.length === 1 && leftLines[0] === '' && rightLines.length === 1 && rightLines[0] === '') {
    return { hunks: [], addedCount: 0, removedCount: 0, isIdentical: true }
  }

  // Left empty — all right lines are additions
  if (leftLines.length === 1 && leftLines[0] === '') {
    const lines: DiffLine[] = rightLines.map((content, i) => ({
      type: 'added' as const,
      leftLineNumber: null,
      rightLineNumber: i + 1,
      content,
    }))
    const hunks = buildHunks(lines, options.contextLines)
    return {
      hunks,
      addedCount: rightLines.length,
      removedCount: 0,
      isIdentical: false,
    }
  }

  // Right empty — all left lines are removals
  if (rightLines.length === 1 && rightLines[0] === '') {
    const lines: DiffLine[] = leftLines.map((content, i) => ({
      type: 'removed' as const,
      leftLineNumber: i + 1,
      rightLineNumber: null,
      content,
    }))
    const hunks = buildHunks(lines, options.contextLines)
    return {
      hunks,
      addedCount: 0,
      removedCount: leftLines.length,
      isIdentical: false,
    }
  }

  // ── Unordered (multiset) path ────────────────────────────────────

  if (options.ignoreLineOrder) {
    return computeUnorderedDiff(
      leftLines,
      rightLines,
      leftNormalized,
      rightNormalized,
      options.contextLines,
    )
  }

  // ── LCS Table ─────────────────────────────────────────────────────
  const m = leftLines.length
  const n = rightLines.length
  const table: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftNormalized[i - 1] === rightNormalized[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  // ── Backtrack — produce edit ops ──────────────────────────────────
  interface EditOp {
    type: 'unchanged' | 'added' | 'removed'
    leftIdx: number
    rightIdx: number
  }

  const ops: EditOp[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      leftNormalized[i - 1] === rightNormalized[j - 1]
    ) {
      ops.push({ type: 'unchanged', leftIdx: i - 1, rightIdx: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      ops.push({ type: 'added', leftIdx: -1, rightIdx: j - 1 })
      j--
    } else {
      ops.push({ type: 'removed', leftIdx: i - 1, rightIdx: -1 })
      i--
    }
  }
  ops.reverse()

  // ── Build DiffLine array from edit ops ────────────────────────────
  const diffLines: DiffLine[] = ops.map((op) => {
    switch (op.type) {
      case 'unchanged':
        return {
          type: 'unchanged' as const,
          leftLineNumber: op.leftIdx + 1,
          rightLineNumber: op.rightIdx + 1,
          content: leftLines[op.leftIdx],
        }
      case 'added':
        return {
          type: 'added' as const,
          leftLineNumber: null,
          rightLineNumber: op.rightIdx + 1,
          content: rightLines[op.rightIdx],
        }
      case 'removed':
        return {
          type: 'removed' as const,
          leftLineNumber: op.leftIdx + 1,
          rightLineNumber: null,
          content: leftLines[op.leftIdx],
        }
    }
  })

  // ── Group into hunks ──────────────────────────────────────────────
  const hunks = buildHunks(diffLines, options.contextLines)

  // ── Count stats ───────────────────────────────────────────────────
  let addedCount = 0
  let removedCount = 0
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type === 'added') addedCount++
      if (line.type === 'removed') removedCount++
    }
  }

  return {
    hunks,
    addedCount,
    removedCount,
    isIdentical: addedCount === 0 && removedCount === 0,
  }
}

// ── Unordered (multiset) diff ──────────────────────────────────────

/**
 * Multiset/bag comparison — ignores line order.
 *
 * Lines with the same normalized key are compared by count:
 *   - Extra copies in original → removed
 *   - Extra copies in modified → added
 *   - Common copies → unchanged
 *
 * Output uses `leftLineNumber: null, rightLineNumber: null` since
 * positions are meaningless in unordered mode.
 */
function computeUnorderedDiff(
  leftLines: string[],
  rightLines: string[],
  leftNormalized: string[],
  rightNormalized: string[],
  _contextLines: number,
): DiffResult {
  // Build per-key line lists preserving original order
  const leftByKey = new Map<string, { index: number; content: string }[]>()
  const rightByKey = new Map<string, { index: number; content: string }[]>()

  for (let i = 0; i < leftLines.length; i++) {
    const key = leftNormalized[i]
    if (!leftByKey.has(key)) leftByKey.set(key, [])
    leftByKey.get(key)!.push({ index: i, content: leftLines[i] })
  }

  for (let i = 0; i < rightLines.length; i++) {
    const key = rightNormalized[i]
    if (!rightByKey.has(key)) rightByKey.set(key, [])
    rightByKey.get(key)!.push({ index: i, content: rightLines[i] })
  }

  // Compute common count per key
  const commonCount = new Map<string, number>()
  const allKeys = new Set([...leftByKey.keys(), ...rightByKey.keys()])
  for (const key of allKeys) {
    const lc = leftByKey.get(key)?.length ?? 0
    const rc = rightByKey.get(key)?.length ?? 0
    commonCount.set(key, Math.min(lc, rc))
  }

  // Track how many instances of each key have been "consumed" as removed/added
  const leftConsumed = new Map<string, number>()
  for (const key of allKeys) leftConsumed.set(key, 0)

  const diffLines: DiffLine[] = []
  let addedCount = 0
  let removedCount = 0

  // Pass A — walk original → emit removed (excess in original)
  for (let i = 0; i < leftLines.length; i++) {
    const key = leftNormalized[i]
    const total = leftByKey.get(key)!.length
    const common = commonCount.get(key)!
    const excess = total - common
    const consumed = leftConsumed.get(key)!

    if (consumed < excess) {
      diffLines.push({
        type: 'removed',
        leftLineNumber: null,
        rightLineNumber: null,
        content: leftLines[i],
      })
      removedCount++
      leftConsumed.set(key, consumed + 1)
    }
  }

  // Reset consumed tracker for the unchanged pass
  for (const key of allKeys) leftConsumed.set(key, 0)

  const rightConsumed = new Map<string, number>()
  for (const key of allKeys) rightConsumed.set(key, 0)

  // Pass B — walk modified → emit added (excess in modified)
  for (let i = 0; i < rightLines.length; i++) {
    const key = rightNormalized[i]
    const total = rightByKey.get(key)!.length
    const common = commonCount.get(key)!
    const excess = total - common
    const consumed = rightConsumed.get(key)!

    if (consumed < excess) {
      diffLines.push({
        type: 'added',
        leftLineNumber: null,
        rightLineNumber: null,
        content: rightLines[i],
      })
      addedCount++
      rightConsumed.set(key, consumed + 1)
    }
  }

  // Pass C — walk original → emit unchanged (common instances)
  for (let i = 0; i < leftLines.length; i++) {
    const key = leftNormalized[i]
    const common = commonCount.get(key)!
    const consumed = leftConsumed.get(key)!

    if (consumed < common) {
      diffLines.push({
        type: 'unchanged',
        leftLineNumber: null,
        rightLineNumber: null,
        content: leftLines[i],
      })
      leftConsumed.set(key, consumed + 1)
    }
  }

  // Build a single unordered hunk (sentinel: leftStart=0, rightStart=0).
  // Never trim context for unordered mode — line numbers are meaningless
  // and buildHunks would replace the sentinel with computed numbers.
  if (diffLines.length === 0) {
    return { hunks: [], addedCount: 0, removedCount: 0, isIdentical: true }
  }

  return {
    hunks: [{ lines: diffLines, leftStart: 0, rightStart: 0 }],
    addedCount,
    removedCount,
    isIdentical: addedCount === 0 && removedCount === 0,
  }
}

// ── Hunk builder ─────────────────────────────────────────────────────

function buildHunks(diffLines: DiffLine[], contextLines: number): DiffHunk[] {
  if (diffLines.length === 0) return []

  // contextLines=0 means "show everything" as one hunk
  if (contextLines === 0) {
    const leftStart =
      diffLines.find((l) => l.leftLineNumber !== null)?.leftLineNumber ?? 1
    const rightStart =
      diffLines.find((l) => l.rightLineNumber !== null)?.rightLineNumber ?? 1
    return [{ lines: diffLines, leftStart, rightStart }]
  }

  // Identify changed-line indices
  const changedIndices = new Set<number>()
  diffLines.forEach((line, idx) => {
    if (line.type === 'added' || line.type === 'removed') {
      changedIndices.add(idx)
    }
  })

  // No changes at all — return empty
  if (changedIndices.size === 0) return []

  // Expand by context window
  const interesting = new Set<number>()
  for (const ci of changedIndices) {
    const start = Math.max(0, ci - contextLines)
    const end = Math.min(diffLines.length - 1, ci + contextLines)
    for (let k = start; k <= end; k++) {
      interesting.add(k)
    }
  }

  // Merge into contiguous ranges
  const sorted = Array.from(interesting).sort((a, b) => a - b)
  const hunks: DiffHunk[] = []
  let rangeStart = sorted[0]

  for (let k = 1; k <= sorted.length; k++) {
    if (k === sorted.length || sorted[k] !== sorted[k - 1] + 1) {
      // End of a contiguous range
      const segment = diffLines.slice(rangeStart, sorted[k - 1] + 1)
      const leftStart =
        segment.find((l) => l.leftLineNumber !== null)?.leftLineNumber ?? 1
      const rightStart =
        segment.find((l) => l.rightLineNumber !== null)?.rightLineNumber ?? 1
      hunks.push({ lines: segment, leftStart, rightStart })
      if (k < sorted.length) rangeStart = sorted[k]
    }
  }

  return hunks
}

// ── Unified diff formatter ───────────────────────────────────────────

/**
 * Format a DiffResult as a unified diff string.
 *
 * Returns an empty string for identical texts.
 * Uses standard @@ -l,s +r,s @@ hunk headers with +/- prefix convention.
 */
export function formatUnifiedDiff(diff: DiffResult): string {
  if (diff.isIdentical || diff.hunks.length === 0) return ''

  const output: string[] = []
  for (const hunk of diff.hunks) {
    const leftCount = hunk.lines.filter((l) => l.type !== 'added').length
    const rightCount = hunk.lines.filter((l) => l.type !== 'removed').length
    if (hunk.leftStart === 0 && hunk.rightStart === 0) {
      output.push('@@ unordered @@')
    } else {
      output.push(
        `@@ -${hunk.leftStart},${leftCount} +${hunk.rightStart},${rightCount} @@`,
      )
    }

    for (const line of hunk.lines) {
      switch (line.type) {
        case 'added':
          output.push(`+${line.content}`)
          break
        case 'removed':
          output.push(`-${line.content}`)
          break
        case 'unchanged':
          output.push(` ${line.content}`)
          break
      }
    }
  }

  return output.join('\n')
}

// ── Unified diff parser ─────────────────────────────────────────────

/**
 * Parse a unified diff string into structured lines for visual rendering.
 *
 * Each line is classified by its marker character:
 *   @@ → hunk header
 *   +  → added line
 *   -  → removed line
 *   (space) → unchanged line
 */
export function parseUnifiedDiffLines(output: string): ParsedDiffLine[] {
  if (!output) return []

  const rawLines = output.split('\n')
  const result: ParsedDiffLine[] = []

  for (const raw of rawLines) {
    if (raw.startsWith('@@')) {
      result.push({ type: 'hunk', marker: '@@', content: raw })
    } else if (raw.startsWith('+') && !raw.startsWith('+++')) {
      result.push({ type: 'added', marker: '+', content: raw.slice(1) })
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      result.push({ type: 'removed', marker: '-', content: raw.slice(1) })
    } else if (raw.startsWith(' ')) {
      result.push({ type: 'unchanged', marker: ' ', content: raw.slice(1) })
    }
    // Lines that don't match any marker are skipped (shouldn't appear in
    // well-formed unified diff output, but we're lenient).
  }

  return result
}

// ── Validation ───────────────────────────────────────────────────────

const MAX_SIZE = 500 * 1024 // 500KB per side for diff performance

/**
 * Validate input text for size limits.
 */
export function validate(
  input: string,
): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  if (new TextEncoder().encode(input).length > MAX_SIZE) {
    return {
      valid: false,
      message: `Input exceeds maximum size of ${formatSize(MAX_SIZE)}`,
    }
  }
  return { valid: true }
}

// ── Stats ────────────────────────────────────────────────────────────

/**
 * Get statistics about the input.
 */
export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input === '' ? 0 : input.split('\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

/**
 * Format byte size for display.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
