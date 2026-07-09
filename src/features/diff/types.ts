/** Diff Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

/** Options controlling diff behavior */
export interface DiffOptions {
  /** Number of unchanged lines to show around changes. 0 = show all. */
  contextLines: number
  /** When true, treat lines with only whitespace differences as equal */
  ignoreWhitespace: boolean
  /** When true, compare case-insensitively */
  ignoreCase: boolean
  /** When true, compare using multiset (bag) semantics — order-independent */
  ignoreLineOrder: boolean
}

export interface DiffConfig extends FeatureConfig, DiffOptions {
  /** Right text to compare against (left text is passed as input) */
  rightText: string
}

/** A single line in the diff output */
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  /** 1-based line number in the left text (null for added lines) */
  leftLineNumber: number | null
  /** 1-based line number in the right text (null for removed lines) */
  rightLineNumber: number | null
  content: string
}

/** A contiguous block of diff lines (a hunk) */
export interface DiffHunk {
  lines: DiffLine[]
  /** 1-based start line number in the left text */
  leftStart: number
  /** 1-based start line number in the right text */
  rightStart: number
}

/** A parsed line from the unified diff output (for visual rendering) */
export interface ParsedDiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'hunk'
  marker: '+' | '-' | ' ' | '@@'
  content: string
}

/** Structured result of the diff computation */
export interface DiffResult {
  hunks: DiffHunk[]
  /** Number of added lines */
  addedCount: number
  /** Number of removed lines */
  removedCount: number
  /** Whether the two texts are identical under the current options */
  isIdentical: boolean
}
