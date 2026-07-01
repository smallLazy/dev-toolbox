/** Timestamp Plugin — Public API */

export { default as TimestampView } from './TimestampView.vue'
export { TimestampFeature } from './TimestampFeature'
export { useTimestamp } from './composables'
export {
  normalizeTimestampInput,
  timestampToDate,
  dateToTimestamp,
  transformTimestamp,
  formatTimestampToDateOutput,
  formatDateToTimestampOutput,
  formatOutput,
  validateTimestampInput,
  validateDateInput,
  validateInput,
  getCurrentTimestamp,
} from './logic'
export type {
  TimestampMode,
  TimestampConfig,
  TimestampToDateResult,
  DateToTimestampResult,
  TimestampResult,
  TimestampValidationError,
  TimestampValidationResult,
  TimestampState,
} from './types'
