/** Wecom Plugin — Public API */

export { default as WecomView } from './WecomView.vue'
export { WecomFeature } from './WecomFeature'
export { useWecom } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { WecomConfig, WecomState } from './types'
