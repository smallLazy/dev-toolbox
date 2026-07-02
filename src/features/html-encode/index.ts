/** HtmlEncode Plugin — Public API */

export { default as HtmlEncodeView } from './HtmlEncodeView.vue'
export { HtmlEncodeFeature } from './HtmlEncodeFeature'
export { useHtmlEncode } from './composables'
export {
  encodeHtml,
  decodeHtml,
  tryDecodeHtml,
  transformHtml,
  getStats,
  formatSize,
  validate,
} from './logic'
export type { HtmlEncodeConfig, HtmlEncodeState, HtmlMode, TryDecodeHtmlResult } from './types'
