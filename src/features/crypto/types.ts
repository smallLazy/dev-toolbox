/**
 * Crypto (AES) Plugin — Type Definitions
 */

export type CryptoMode = 'encrypt' | 'decrypt'

export type AesAlgorithm = 'aes-256-cbc' | 'aes-256-ecb'

export type CryptoEncoding = 'utf8' | 'hex' | 'base64'

export type CryptoOutputEncoding = 'hex' | 'base64'

export interface CryptoInConfig {
  algorithm: AesAlgorithm
  keyEncoding: CryptoEncoding
  ivEncoding: CryptoEncoding
  inputEncoding: CryptoEncoding
  outputEncoding: CryptoOutputEncoding
}

export interface CryptoConfig {
  mode: CryptoMode
  inConfig: CryptoInConfig
}

/** Mirrors Rust AesCryptRequest — field names must match exactly. */
export interface AesCryptParams {
  mode: string
  algorithm: string
  key: string
  iv: string
  input: string
  keyEncoding: string
  ivEncoding: string
  inputEncoding: string
  outputEncoding: string
}

export interface CryptoResult {
  input: string
  output: string
  config: CryptoConfig
}

export interface CryptoValidationError {
  code: string
  message: string
  field?: string
}

export type CryptoValidationResult =
  | { valid: true }
  | { valid: false; errors: CryptoValidationError[] }

export interface CryptoState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
