/** Unicode Plugin — Public API */

export { default as UnicodeView } from './UnicodeView.vue'
export { UnicodeFeature } from './UnicodeFeature'
export { useUnicode } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { UnicodeConfig, UnicodeState } from './types'
