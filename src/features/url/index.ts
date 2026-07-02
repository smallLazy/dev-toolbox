/** URL Plugin — Public API */

export { default as UrlView } from './UrlView.vue'
export { UrlFeature } from './UrlFeature'
export { useUrl } from './composables'
export {
  encodeUrl,
  decodeUrl,
  transformUrl,
  validateUrlInput,
  validateDecodeInput,
  getStats,
  formatSize,
  tryDecodeUrl,
} from './logic'
export type { TryDecodeResult } from './logic'
export type {
  UrlMode,
  UrlVariant,
  UrlConfig,
  UrlResult,
  UrlValidationError,
  UrlValidationResult,
  TextStats,
  UrlState,
} from './types'
