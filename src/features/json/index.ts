/** JSON Plugin — Public API */

export { default as JsonView } from './JsonView.vue'
export { JsonFeature } from './JsonFeature'
export { useJsonPlugin } from './composables'
export {
  formatJson, minifyJson, validateJson, sortKeys,
  getStats, formatSize,
} from './logic'
export { jsonSettingsSchema, jsonDefaults } from './settings'
export type { JsonConfig, JsonState, JsonMode, JsonFormatResult, JsonValidateResult } from './types'
