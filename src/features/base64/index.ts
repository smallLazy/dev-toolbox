/** Base64 Plugin — Public API */

export { default as Base64View } from './Base64View.vue'
export { Base64Feature } from './Base64Feature'
export { useBase64 } from './composables'
export { encode, decode, validate, validateBase64, getStats, formatSize } from './logic'
export type { Base64Config, Base64State, Base64Result, Base64ValidationResult, TextStats } from './types'
