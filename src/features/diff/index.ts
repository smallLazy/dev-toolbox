/** Diff Plugin — Public API */

export { default as DiffView } from './DiffView.vue'
export { DiffFeature } from './DiffFeature'
export { useDiff } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { DiffConfig, DiffState } from './types'
