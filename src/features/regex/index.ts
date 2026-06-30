/** Regex Plugin — Public API */

export { default as RegexView } from './RegexView.vue'
export { RegexFeature } from './RegexFeature'
export { useRegex } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { RegexConfig, RegexState } from './types'
