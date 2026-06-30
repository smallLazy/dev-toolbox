/** Explain Plugin — Public API */

export { default as ExplainView } from './ExplainView.vue'
export { ExplainFeature } from './ExplainFeature'
export { useExplain } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { ExplainConfig, ExplainState } from './types'
