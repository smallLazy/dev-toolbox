/** Unicode Plugin — Public API */

export { default as UnicodeView } from './UnicodeView.vue'
export { UnicodeFeature } from './UnicodeFeature'
export { useUnicode } from './composables'
export {
  encodeUnicode,
  decodeUnicode,
  tryDecodeUnicode,
  transformUnicode,
  validate,
  getStats,
  formatSize,
} from './logic'
export type {
  UnicodeMode,
  UnicodeVariant,
  UnicodeConfig,
  UnicodeState,
  TextStats,
  UnicodeResult,
  TryDecodeUnicodeResult,
} from './types'
