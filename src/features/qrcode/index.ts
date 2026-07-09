/** Qrcode Plugin — Public API */

export { default as QrcodeView } from './QrcodeView.vue'
export { QrcodeFeature } from './QrcodeFeature'
export { useQrcode } from './composables'
export {
  getStats,
  formatSize,
  generateQrCode,
  validateQrInput,
  getQrStats,
  normalizeQrOptions,
  SAMPLE_INPUT,
} from './logic'
export type {
  QrcodeConfig,
  QrcodeState,
  QrErrorCorrectionLevel,
  QrCodeOptions,
  QrCodeResult,
  QrCodeStats,
  QrValidationResult,
} from './types'
