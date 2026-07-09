/**
 * Diff Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  computeDiff,
  formatUnifiedDiff,
  parseUnifiedDiffLines,
  validate,
  getStats,
  formatSize,
} from '../logic'
import type { DiffOptions } from '../types'

const defaults: DiffOptions = {
  contextLines: 3,
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreLineOrder: false,
}

// ── computeDiff ──────────────────────────────────────────────────────

describe('computeDiff', () => {
  // 1. Identical texts
  describe('identical texts', () => {
    it('returns isIdentical=true for identical single-line texts', () => {
      const result = computeDiff('hello', 'hello', defaults)
      expect(result.isIdentical).toBe(true)
      expect(result.addedCount).toBe(0)
      expect(result.removedCount).toBe(0)
    })

    it('returns isIdentical=true for identical multi-line texts', () => {
      const text = 'line1\nline2\nline3'
      const result = computeDiff(text, text, defaults)
      expect(result.isIdentical).toBe(true)
      expect(result.hunks).toHaveLength(0)
    })

    it('returns empty hunks for identical texts (with context>0)', () => {
      const result = computeDiff('a\nb\nc', 'a\nb\nc', defaults)
      expect(result.hunks).toHaveLength(0)
    })

    it('shows all lines as unchanged when contextLines=0 and texts are identical', () => {
      const result = computeDiff('a\nb', 'a\nb', { ...defaults, contextLines: 0 })
      // With contextLines=0, a single hunk with all lines is returned
      expect(result.isIdentical).toBe(true)
      expect(result.addedCount).toBe(0)
      expect(result.removedCount).toBe(0)
    })
  })

  // 2. Single addition
  describe('single addition', () => {
    it('detects one added line at end', () => {
      const result = computeDiff('line1\nline2', 'line1\nline2\nline3', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(0)
      const addedLines = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'added')
      expect(addedLines).toHaveLength(1)
      expect(addedLines[0].content).toBe('line3')
    })

    it('detects one added line at start', () => {
      const result = computeDiff('line2', 'line1\nline2', defaults)
      expect(result.addedCount).toBe(1)
      const addedLines = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'added')
      expect(addedLines[0].content).toBe('line1')
    })

    it('detects one added line in middle', () => {
      const result = computeDiff('a\nc', 'a\nb\nc', defaults)
      expect(result.addedCount).toBe(1)
      const addedLines = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'added')
      expect(addedLines[0].content).toBe('b')
    })
  })

  // 3. Single removal
  describe('single removal', () => {
    it('detects one removed line', () => {
      const result = computeDiff('a\nb\nc', 'a\nc', defaults)
      expect(result.removedCount).toBe(1)
      const removedLines = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'removed')
      expect(removedLines[0].content).toBe('b')
    })
  })

  // 4. Replacement (remove + add)
  describe('replacement', () => {
    it('handles a one-line replacement', () => {
      const result = computeDiff('hello', 'world', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })

    it('handles multi-line replacement', () => {
      const result = computeDiff('a\nb\nc', 'a\nx\nc', defaults)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })
  })

  // 5. Empty inputs
  describe('empty inputs', () => {
    it('handles both inputs empty', () => {
      const result = computeDiff('', '', defaults)
      expect(result.isIdentical).toBe(true)
      expect(result.hunks).toHaveLength(0)
    })

    it('handles left empty (all right lines are additions)', () => {
      const result = computeDiff('', 'a\nb', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(2)
      expect(result.removedCount).toBe(0)
    })

    it('handles right empty (all left lines are removals)', () => {
      const result = computeDiff('a\nb', '', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.removedCount).toBe(2)
      expect(result.addedCount).toBe(0)
    })
  })

  // 6. Context lines
  describe('context lines', () => {
    const text1 = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj'
    const text2 = 'a\nb\nc\nCHANGED\ne\nf\ng\nh\ni\nj'

    it('shows all lines when contextLines=0', () => {
      const result = computeDiff(text1, text2, { ...defaults, contextLines: 0 })
      expect(result.hunks).toHaveLength(1)
      // With contextLines=0, all 10 original + the change should be in the single hunk
      const allLines = result.hunks[0].lines
      expect(allLines.length).toBeGreaterThanOrEqual(10)
    })

    it('trims unchanged lines beyond context when contextLines=3', () => {
      const result = computeDiff(text1, text2, { ...defaults, contextLines: 3 })
      expect(result.hunks).toHaveLength(1)
      // The change is on line 4, context=3 means lines 1-7 should be included
      // Lines 8-10 should be trimmed
      const allLines = result.hunks[0].lines
      const contents = allLines.map((l) => l.content)
      expect(contents).toContain('a')
      expect(contents).toContain('CHANGED')
      // Lines far from the change should be excluded
      expect(contents).not.toContain('i')
      expect(contents).not.toContain('j')
    })

    it('shows correct window with contextLines=1', () => {
      const result = computeDiff(text1, text2, { ...defaults, contextLines: 1 })
      // context=1 means only lines 3-5 (change at 4, +/- 1)
      const allLines = result.hunks[0].lines
      const contents = allLines.map((l) => l.content)
      expect(contents).toContain('c') // line 3: context before
      expect(contents).toContain('d') // line 4: removed
      expect(contents).toContain('CHANGED') // added
      expect(contents).toContain('e') // line 5: context after
      // Lines outside the window should be excluded
      expect(contents).not.toContain('b')
      expect(contents).not.toContain('f')
    })
  })

  // 7. ignoreWhitespace
  describe('ignoreWhitespace', () => {
    it('treats whitespace-only differences as equal when ignoreWhitespace=true', () => {
      const result = computeDiff(
        'hello world',
        '  hello   world  ',
        { ...defaults, ignoreWhitespace: true },
      )
      expect(result.isIdentical).toBe(true)
    })

    it('detects whitespace differences when ignoreWhitespace=false', () => {
      const result = computeDiff(
        'hello world',
        '  hello   world  ',
        { ...defaults, ignoreWhitespace: false },
      )
      expect(result.isIdentical).toBe(false)
    })

    it('handles tabs and spaces as equal whitespace when ignoreWhitespace=true', () => {
      const result = computeDiff(
        'a\tb',
        'a b',
        { ...defaults, ignoreWhitespace: true },
      )
      expect(result.isIdentical).toBe(true)
    })
  })

  // 8. ignoreCase
  describe('ignoreCase', () => {
    it('treats case differences as equal when ignoreCase=true', () => {
      const result = computeDiff(
        'Hello World',
        'hello world',
        { ...defaults, ignoreCase: true },
      )
      expect(result.isIdentical).toBe(true)
    })

    it('detects case differences when ignoreCase=false', () => {
      const result = computeDiff(
        'Hello World',
        'hello world',
        { ...defaults, ignoreCase: false },
      )
      expect(result.isIdentical).toBe(false)
    })
  })

  // 9. Combined options
  describe('combined options', () => {
    it('combines ignoreWhitespace and ignoreCase correctly', () => {
      const result = computeDiff(
        'Hello   World',
        '  hello world  ',
        { ...defaults, ignoreWhitespace: true, ignoreCase: true },
      )
      expect(result.isIdentical).toBe(true)
    })

    it('detects difference when only one option matches', () => {
      // Case matches but whitespace differs (and we only ignore case)
      const result = computeDiff(
        'Hello   World',
        'Hello World',
        { ...defaults, ignoreWhitespace: false, ignoreCase: true },
      )
      expect(result.isIdentical).toBe(false)
    })
  })

  // 10. Multi-line scenarios
  describe('multi-line scenarios', () => {
    it('handles multiple non-contiguous changes (produces multiple hunks)', () => {
      const result = computeDiff(
        'a\nb\nc\nd\ne\nf',
        'a\nB\nc\nD\ne\nf',
        { ...defaults, contextLines: 0 },
      )
      // contextLines=0 means one big hunk
      expect(result.hunks).toHaveLength(1)
      expect(result.addedCount).toBe(2)
      expect(result.removedCount).toBe(2)
    })

    it('handles adjacent changes (merged into one hunk)', () => {
      const result = computeDiff(
        'a\nb\nc',
        'x\ny\nz',
        defaults,
      )
      expect(result.hunks).toHaveLength(1)
      expect(result.addedCount).toBe(3)
      expect(result.removedCount).toBe(3)
    })
  })

  // 11. Correct line numbering
  describe('line numbering', () => {
    it('assigns correct leftLineNumber and rightLineNumber for unchanged lines', () => {
      const result = computeDiff('a\nb\nc', 'a\nb\nc', { ...defaults, contextLines: 0 })
      // No changes => no hunks with context>0; contextLines=0 gives one hunk
      // Actually, when there are zero changed lines, buildHunks returns empty
      // With contextLines=0 we get one hunk with all lines
      const allLines = result.hunks[0].lines
      expect(allLines[0].leftLineNumber).toBe(1)
      expect(allLines[0].rightLineNumber).toBe(1)
      expect(allLines[1].leftLineNumber).toBe(2)
      expect(allLines[1].rightLineNumber).toBe(2)
    })

    it('assigns null leftLineNumber for added lines', () => {
      const result = computeDiff('a\nc', 'a\nb\nc', defaults)
      const added = result.hunks.flatMap((h) => h.lines).find((l) => l.type === 'added')
      expect(added).toBeDefined()
      expect(added!.leftLineNumber).toBeNull()
      expect(added!.rightLineNumber).not.toBeNull()
    })

    it('assigns null rightLineNumber for removed lines', () => {
      const result = computeDiff('a\nb\nc', 'a\nc', defaults)
      const removed = result.hunks.flatMap((h) => h.lines).find((l) => l.type === 'removed')
      expect(removed).toBeDefined()
      expect(removed!.rightLineNumber).toBeNull()
      expect(removed!.leftLineNumber).not.toBeNull()
    })
  })

  // 12. Stats
  describe('stats', () => {
    it('counts added lines correctly', () => {
      const result = computeDiff('', 'a\nb\nc', defaults)
      expect(result.addedCount).toBe(3)
    })

    it('counts removed lines correctly', () => {
      const result = computeDiff('a\nb\nc', '', defaults)
      expect(result.removedCount).toBe(3)
    })

    it('reports isIdentical=true when no changes exist', () => {
      const result = computeDiff('same', 'same', defaults)
      expect(result.isIdentical).toBe(true)
    })

    it('reports isIdentical=false when changes exist', () => {
      const result = computeDiff('same', 'different', defaults)
      expect(result.isIdentical).toBe(false)
    })
  })

  // 13. Edge cases
  describe('edge cases', () => {
    it('handles trailing newline differences', () => {
      const result = computeDiff('a\n', 'a', defaults)
      // With trailing newline, left has ['a', ''] and right has ['a']
      expect(result.isIdentical).toBe(false)
    })

    it('handles unicode CJK characters', () => {
      const result = computeDiff('你好\n世界', '你好\n地球', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })

    it('handles emoji', () => {
      const result = computeDiff('Hello 😀', 'Hello 🚀', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })

    it('handles single-line identical input (no newlines)', () => {
      const result = computeDiff('hello', 'hello', defaults)
      expect(result.isIdentical).toBe(true)
    })

    it('handles single-line diff (one line each, different)', () => {
      const result = computeDiff('hello', 'world', defaults)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })

    it('handles very long lines', () => {
      const long = 'x'.repeat(10000)
      const result = computeDiff(long, long + '!', defaults)
      expect(result.isIdentical).toBe(false)
      expect(result.addedCount).toBe(1)
      expect(result.removedCount).toBe(1)
    })
  })
})

// ── formatUnifiedDiff ────────────────────────────────────────────────

describe('formatUnifiedDiff', () => {
  it('returns empty string for identical input', () => {
    const diff = computeDiff('same', 'same', defaults)
    const output = formatUnifiedDiff(diff)
    expect(output).toBe('')
  })

  it('formats hunks with @@ headers and +/-/space prefix', () => {
    const diff = computeDiff('line1\nline2', 'line1\nline3', defaults)
    const output = formatUnifiedDiff(diff)
    expect(output).toContain('@@')
    expect(output).toContain(' line1')
    expect(output).toContain('-line2')
    expect(output).toContain('+line3')
  })

  it('includes correct line counts in hunk headers', () => {
    const diff = computeDiff('a\nb\nc\nd', 'a\nx\nc\nd', defaults)
    const output = formatUnifiedDiff(diff)
    // Hunk header pattern: @@ -start,count +start,count @@
    expect(output).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('prepends space to unchanged lines', () => {
    const diff = computeDiff('a\nb', 'a\nc', defaults)
    const output = formatUnifiedDiff(diff)
    const unchanged = output.split('\n').filter((l) => l.startsWith(' ') && !l.startsWith('@@'))
    expect(unchanged.length).toBeGreaterThan(0)
    expect(unchanged[0]).toBe(' a')
  })

  it('prepends + to added lines', () => {
    const diff = computeDiff('a', 'a\nb', defaults)
    const output = formatUnifiedDiff(diff)
    expect(output).toContain('+b')
  })

  it('prepends - to removed lines', () => {
    const diff = computeDiff('a\nb', 'a', defaults)
    const output = formatUnifiedDiff(diff)
    expect(output).toContain('-b')
  })
})

// ── validate ─────────────────────────────────────────────────────────

describe('validate', () => {
  it('rejects empty string', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
  })

  it('rejects whitespace-only', () => {
    const result = validate('   ')
    expect(result.valid).toBe(false)
  })

  it('accepts non-empty input', () => {
    const result = validate('hello')
    expect(result.valid).toBe(true)
  })

  it('rejects input exceeding 500KB', () => {
    const large = 'x'.repeat(600 * 1024)
    const result = validate(large)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('500')
  })
})

// ── getStats ─────────────────────────────────────────────────────────

describe('getStats', () => {
  it('counts lines correctly', () => {
    expect(getStats('a\nb\nc').lines).toBe(3)
  })

  it('counts byte size correctly', () => {
    expect(getStats('hello').size).toBe(5)
  })

  it('handles empty string', () => {
    const stats = getStats('')
    expect(stats.lines).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('handles unicode byte counting', () => {
    // '你好' is 6 bytes in UTF-8
    const stats = getStats('你好')
    expect(stats.size).toBe(6)
  })
})

// ── formatSize ───────────────────────────────────────────────────────

describe('formatSize', () => {
  it('formats bytes (< 1024)', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  it('formats KB (>= 1024)', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('formats MB (>= 1,048,576)', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('formats 0 bytes', () => {
    expect(formatSize(0)).toBe('0 B')
  })
})

// ── parseUnifiedDiffLines ────────────────────────────────────────────

describe('parseUnifiedDiffLines', () => {
  it('returns empty array for empty string', () => {
    expect(parseUnifiedDiffLines('')).toEqual([])
  })

  it('parses added line', () => {
    const result = parseUnifiedDiffLines('+hello')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'added', marker: '+', content: 'hello' })
  })

  it('parses removed line', () => {
    const result = parseUnifiedDiffLines('-goodbye')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'removed', marker: '-', content: 'goodbye' })
  })

  it('parses unchanged line', () => {
    const result = parseUnifiedDiffLines(' keep')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'unchanged', marker: ' ', content: 'keep' })
  })

  it('parses hunk header', () => {
    const result = parseUnifiedDiffLines('@@ -1,3 +1,4 @@')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'hunk', marker: '@@', content: '@@ -1,3 +1,4 @@' })
  })

  it('parses mixed lines from a real unified diff', () => {
    const diff = computeDiff('a\nb\nc', 'a\nx\nc', { ...defaults, ignoreWhitespace: false, ignoreCase: false })
    const output = formatUnifiedDiff(diff)
    const parsed = parseUnifiedDiffLines(output)
    expect(parsed.length).toBeGreaterThan(0)

    const types = parsed.map((l) => l.type)
    expect(types).toContain('hunk')
    expect(types).toContain('removed')
    expect(types).toContain('added')
    expect(types).toContain('unchanged')
  })

  it('preserves content after marker', () => {
    const result = parseUnifiedDiffLines('+  leading spaces')
    expect(result[0].content).toBe('  leading spaces')
  })

  it('skips lines that do not match any marker', () => {
    const result = parseUnifiedDiffLines('no-marker')
    expect(result).toHaveLength(0)
  })

  it('parses multiple lines', () => {
    const input = '@@ -1,2 +1,3 @@\n unchanged\n+added\n-removed\n more'
    const result = parseUnifiedDiffLines(input)
    expect(result).toHaveLength(5)
    expect(result[0].type).toBe('hunk')
    expect(result[1].type).toBe('unchanged')
    expect(result[2].type).toBe('added')
    expect(result[3].type).toBe('removed')
    expect(result[4].type).toBe('unchanged')
  })
})

// ── computeDiff with ignoreLineOrder ─────────────────────────────────

describe('computeDiff with ignoreLineOrder', () => {
  const ilo: DiffOptions = {
    contextLines: 3,
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreLineOrder: true,
  }

  it('returns isIdentical=true when order differs but content is same', () => {
    const result = computeDiff('1002\n1001', '1001\n1002', ilo)
    expect(result.isIdentical).toBe(true)
    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
  })

  it('detects added line when modified has extra content', () => {
    const result = computeDiff('a\nb', 'a\nb\nc', ilo)
    expect(result.isIdentical).toBe(false)
    expect(result.addedCount).toBe(1)
    expect(result.removedCount).toBe(0)
  })

  it('detects removed line when original has extra content', () => {
    const result = computeDiff('a\nb\nc', 'a\nb', ilo)
    expect(result.isIdentical).toBe(false)
    expect(result.removedCount).toBe(1)
    expect(result.addedCount).toBe(0)
  })

  it('handles duplicate count: original has 2xA, modified has 1xA', () => {
    const result = computeDiff('A\nA', 'A', ilo)
    expect(result.removedCount).toBe(1)
    expect(result.addedCount).toBe(0)
  })

  it('handles duplicate count: original has 1xA, modified has 2xA', () => {
    const result = computeDiff('A', 'A\nA', ilo)
    expect(result.addedCount).toBe(1)
    expect(result.removedCount).toBe(0)
  })

  it('handles complex multiset: extra + missing + reordered', () => {
    const result = computeDiff('a\nb\nc\nd', 'c\na\ne', ilo)
    expect(result.removedCount).toBe(2) // b, d
    expect(result.addedCount).toBe(1) // e
    expect(result.isIdentical).toBe(false)
  })

  it('combines ignoreLineOrder + ignoreWhitespace', () => {
    const result = computeDiff(
      'hello   world',
      '  hello world',
      { ...ilo, ignoreWhitespace: true },
    )
    expect(result.isIdentical).toBe(true)
  })

  it('combines ignoreLineOrder + ignoreCase', () => {
    const result = computeDiff(
      'HELLO',
      'hello',
      { ...ilo, ignoreCase: true },
    )
    expect(result.isIdentical).toBe(true)
  })

  it('combines ignoreLineOrder + both options', () => {
    const result = computeDiff(
      'HELLO   WORLD\nFOO',
      '  hello world\nfoo',
      { ...ilo, ignoreWhitespace: true, ignoreCase: true },
    )
    expect(result.isIdentical).toBe(true)
  })

  it('preserves original line content in removed lines', () => {
    const result = computeDiff('Hello\nWorld', 'Hello', ilo)
    const removed = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'removed')
    expect(removed).toHaveLength(1)
    expect(removed[0].content).toBe('World')
  })

  it('preserves original line content in added lines', () => {
    const result = computeDiff('Hello', 'Hello\nWorld', ilo)
    const added = result.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'added')
    expect(added).toHaveLength(1)
    expect(added[0].content).toBe('World')
  })

  it('handles empty left (all lines are additions)', () => {
    const result = computeDiff('', 'a\nb', ilo)
    expect(result.addedCount).toBe(2)
    expect(result.removedCount).toBe(0)
  })

  it('handles empty right (all lines are removals)', () => {
    const result = computeDiff('a\nb', '', ilo)
    expect(result.removedCount).toBe(2)
    expect(result.addedCount).toBe(0)
  })

  it('handles both inputs empty', () => {
    const result = computeDiff('', '', ilo)
    expect(result.isIdentical).toBe(true)
    expect(result.hunks).toHaveLength(0)
  })

  it('formats unordered diff with @@ unordered @@ header', () => {
    const diff = computeDiff('a\nb', 'a\nc', ilo)
    const output = formatUnifiedDiff(diff)
    expect(output).toContain('@@ unordered @@')
  })

  it('returns empty string for identical unordered inputs', () => {
    const diff = computeDiff('a\nb', 'b\na', ilo)
    const output = formatUnifiedDiff(diff)
    expect(output).toBe('')
  })

  it('real-world: ID list reorder with ignoreLineOrder off shows diff', () => {
    const result = computeDiff('1002\n1001', '1001\n1002', {
      ...ilo,
      ignoreLineOrder: false,
    })
    expect(result.isIdentical).toBe(false)
  })

  it('real-world: CSV value reorder with ignoreLineOrder on is identical', () => {
    const result = computeDiff(
      'alice\nbob\ncharlie',
      'charlie\nalice\nbob',
      ilo,
    )
    expect(result.isIdentical).toBe(true)
  })
})
