/** Qrcode Plugin — Public API */

export { default as QrcodeView } from './QrcodeView.vue'
export { QrcodeFeature } from './QrcodeFeature'
export { useQrcode } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { QrcodeConfig, QrcodeState } from './types'
