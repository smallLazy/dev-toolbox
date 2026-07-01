/**
 * JWT Plugin — Pure Logic
 *
 * Decode JWT tokens locally. No signature verification.
 */

import type {
  JwtConfig,
  JwtDecodedPart,
  JwtPayloadInfo,
  JwtTimeClaim,
  JwtResult,
  JwtValidationResult,
} from './types'

// ── Base64url ────────────────────────────────────────────────────────

/** Convert Base64url to standard Base64 */
export function base64UrlToBase64(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4 !== 0) str += '='
  return str
}

/** Decode a Base64url-encoded string to UTF-8 */
export function base64UrlDecode(input: string): string {
  const base64 = base64UrlToBase64(input)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

// ── Token splitting ──────────────────────────────────────────────────

export function splitJwt(token: string): { header: string; payload: string; signature: string } {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: token must have exactly 3 parts (header.payload.signature)')
  }
  return { header: parts[0], payload: parts[1], signature: parts[2] }
}

// ── Part decoding ────────────────────────────────────────────────────

export function parseJsonPart(raw: string): JwtDecodedPart {
  let decoded: string
  let json: unknown | null = null
  let formatted: string

  try {
    decoded = base64UrlDecode(raw)
  } catch {
    throw new Error('Invalid JWT: failed to decode Base64url part')
  }

  try {
    json = JSON.parse(decoded)
    formatted = JSON.stringify(json, null, 2)
  } catch {
    // Not valid JSON — keep decoded text
    formatted = decoded
  }

  return { raw, decoded, json, formatted }
}

// ── Claims ───────────────────────────────────────────────────────────

export function parseNumericDate(value: unknown): JwtTimeClaim | undefined {
  if (typeof value !== 'number') return undefined
  const ms = value * 1000
  const now = Date.now()
  return {
    value,
    iso: new Date(ms).toISOString(),
    local: new Date(ms).toLocaleString('en-US'),
    expired: ms < now,
  }
}

export function extractPayloadInfo(payloadJson: unknown): JwtPayloadInfo {
  if (!payloadJson || typeof payloadJson !== 'object') return {}
  const obj = payloadJson as Record<string, unknown>
  const info: JwtPayloadInfo = {}
  if ('exp' in obj) info.exp = parseNumericDate(obj.exp)
  if ('iat' in obj) info.iat = parseNumericDate(obj.iat)
  if ('nbf' in obj) info.nbf = parseNumericDate(obj.nbf)
  return info
}

// ── Main decode ──────────────────────────────────────────────────────

export function decodeJwt(token: string, _config?: JwtConfig): JwtResult {
  const parts = splitJwt(token)
  const header = parseJsonPart(parts.header)
  const payload = parseJsonPart(parts.payload)
  const payloadInfo = extractPayloadInfo(payload.json)
  const output = formatJwtOutput({ header, payload, signature: parts.signature })

  return {
    input: token,
    header,
    payload,
    signature: parts.signature,
    payloadInfo,
    output,
  }
}

// ── Format for display / copy-all ────────────────────────────────────

function formatJwtOutput(parts: {
  header: JwtDecodedPart
  payload: JwtDecodedPart
  signature: string
}): string {
  return [
    'Header:',
    parts.header.formatted,
    '',
    'Payload:',
    parts.payload.formatted,
    '',
    'Signature:',
    parts.signature,
  ].join('\n')
}

// ── Validation ──────────────────────────────────────────────────────

export function validateJwtInput(input: string): JwtValidationResult {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'EMPTY_INPUT', message: 'JWT token is empty' }],
    }
  }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return {
      valid: false,
      errors: [
        {
          field: 'input',
          code: 'INVALID_FORMAT',
          message: 'Invalid JWT: token must have exactly 3 parts (header.payload.signature)',
        },
      ],
    }
  }

  // Pre-validate Base64url decoding
  try {
    base64UrlDecode(parts[0])
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_HEADER', message: 'Invalid JWT: header is not valid Base64url' },
      ],
    }
  }

  try {
    base64UrlDecode(parts[1])
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_PAYLOAD', message: 'Invalid JWT: payload is not valid Base64url' },
      ],
    }
  }

  return { valid: true }
}

// ── Statistics ──────────────────────────────────────────────────────

export function getStats(input: string): { chars: number; bytes: number; lines: number } {
  return {
    chars: input.length,
    lines: input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}
