/** Color Plugin — Public API */

export { default as ColorView } from './ColorView.vue'
export { ColorFeature } from './ColorFeature'
export { useColor } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { ColorConfig, ColorState } from './types'
