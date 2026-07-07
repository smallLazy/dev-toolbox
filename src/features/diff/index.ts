/** Diff Plugin — Public API */

export { default as DiffView } from './DiffView.vue'
export { DiffFeature } from './DiffFeature'
export { useDiff } from './composables'
export { computeDiff, formatUnifiedDiff, parseUnifiedDiffLines, validate, getStats, formatSize } from './logic'
export type { DiffConfig, DiffOptions, DiffResult, DiffLine, DiffHunk, ParsedDiffLine } from './types'
