/** Translate Plugin — Public API */

export { default as TranslateView } from './TranslateView.vue'
export { TranslateFeature } from './TranslateFeature'
export { useTranslate } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { TranslateConfig, TranslateState } from './types'
