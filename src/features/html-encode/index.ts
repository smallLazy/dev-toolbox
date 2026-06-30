/** HtmlEncode Plugin — Public API */

export { default as HtmlEncodeView } from './HtmlEncodeView.vue'
export { HtmlEncodeFeature } from './HtmlEncodeFeature'
export { useHtmlEncode } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { HtmlEncodeConfig, HtmlEncodeState } from './types'
