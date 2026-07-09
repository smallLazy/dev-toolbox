/** QR Code Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrCodeOptions {
  size: number
  margin: number
  errorCorrectionLevel: QrErrorCorrectionLevel
}

export interface QrcodeConfig extends FeatureConfig {
  size: number
  margin: number
  errorCorrectionLevel: QrErrorCorrectionLevel
}

export interface QrcodeState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

export interface QrValidationResult {
  valid: boolean
  message: string
}

export interface QrCodeResult {
  success: boolean
  dataUrl?: string
  error?: string
}

export interface QrCodeStats {
  characters: number
  bytes: number
  size: number
  margin: number
  errorCorrectionLevel: QrErrorCorrectionLevel
}
