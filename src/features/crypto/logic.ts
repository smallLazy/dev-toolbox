/**
 * Crypto (AES) Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no DOM access.
 */

import type {
  AesAlgorithm,
  AesCryptParams,
  CryptoConfig,
  CryptoInConfig,
  CryptoMode,
  CryptoValidationError,
  CryptoValidationResult,
} from './types'

// ── IV Requirement ────────────────────────────────────────────────────

/** CBC requires an IV; ECB does not. */
export function isIvRequired(algorithm: AesAlgorithm): boolean {
  return algorithm === 'aes-256-cbc'
}

// ── Build invoke Parameters ───────────────────────────────────────────

/**
 * Build the exact parameter object expected by the Rust `aes_crypt` command.
 *
 * Field names MUST match `AesCryptRequest` in `src-tauri/src/models/mod.rs`
 * (serialized with `#[serde(rename_all = "camelCase")]`).
 *
 * For ECB mode, `iv` is always an empty string.
 */
export function buildAesCryptParams(args: {
  mode: CryptoMode
  algorithm: AesAlgorithm
  key: string
  iv: string
  input: string
  inConfig: CryptoInConfig
}): AesCryptParams {
  return {
    mode: args.mode,
    algorithm: args.algorithm,
    key: args.key,
    iv: isIvRequired(args.algorithm) ? args.iv : '',
    input: args.input,
    keyEncoding: args.inConfig.keyEncoding,
    ivEncoding: isIvRequired(args.algorithm) ? args.inConfig.ivEncoding : 'utf8',
    inputEncoding: args.inConfig.inputEncoding,
    outputEncoding: args.inConfig.outputEncoding,
  }
}

// ── Input Validation ──────────────────────────────────────────────────

export function validateCryptoInput(
  input: string,
  key: string,
  algorithm: AesAlgorithm,
  iv: string,
): CryptoValidationResult {
  const errors: CryptoValidationError[] = []

  if (!input.trim()) {
    errors.push({ code: 'EMPTY_INPUT', message: 'Input is required', field: 'input' })
  }

  if (!key.trim()) {
    errors.push({ code: 'EMPTY_KEY', message: 'Key is required', field: 'key' })
  }

  if (isIvRequired(algorithm) && !iv.trim()) {
    errors.push({ code: 'EMPTY_IV', message: 'IV is required for CBC mode', field: 'iv' })
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

// ── Key Length Validation (best-effort, Rust does final check) ────────

export function validateKeyLength(
  key: string,
  encoding: string,
): CryptoValidationResult {
  let byteLen: number

  switch (encoding) {
    case 'utf8':
      byteLen = new TextEncoder().encode(key).length
      break
    case 'hex': {
      // Every 2 hex chars = 1 byte
      const stripped = key.replace(/\s/g, '')
      if (!/^[0-9a-fA-F]*$/.test(stripped)) {
        return {
          valid: false,
          errors: [{ code: 'INVALID_HEX', message: 'Key contains invalid hex characters', field: 'key' }],
        }
      }
      byteLen = stripped.length / 2
      break
    }
    case 'base64': {
      // Rough estimate: base64 length * 3/4
      const stripped = key.replace(/\s/g, '')
      byteLen = Math.floor((stripped.length * 3) / 4)
      break
    }
    default:
      return { valid: true }
  }

  if (byteLen !== 32) {
    return {
      valid: false,
      errors: [
        {
          code: 'WRONG_KEY_LENGTH',
          message: `Key must be 32 bytes, got ${byteLen} bytes. Check the key encoding setting.`,
          field: 'key',
        },
      ],
    }
  }

  return { valid: true }
}

// ── Transform (dispatch by mode) ──────────────────────────────────────

export function transformCrypto(
  input: string,
  config: CryptoConfig,
): { params: AesCryptParams } {
  const params = buildAesCryptParams({
    mode: config.mode,
    algorithm: config.inConfig.algorithm,
    key: '', // key/iv come from user input, not config — caller fills them in
    iv: '',
    input,
    inConfig: config.inConfig,
  })
  return { params }
}

// ── Statistics ──────────────────────────────────────────────────────────

export function getStats(input: string): {
  chars: number
  bytes: number
  lines: number
} {
  return {
    chars: input.length,
    bytes: new TextEncoder().encode(input).length,
    lines: input.split('\n').length,
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
