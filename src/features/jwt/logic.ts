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

// ── Example token ──────────────────────────────────────────────────────

/**
 * Example JWT token for the "Example" button.
 * Uses a static signature — this tool decodes only, it does not verify.
 */
export const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBUb29sYm94IiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjE4OTM0NTYwMDB9.example-signature'

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
    throw new Error('Invalid JWT: expected 3 parts')
  }
  return { header: parts[0], payload: parts[1], signature: parts[2] }
}

// ── Part decoding ────────────────────────────────────────────────────

/**
 * Decode and parse a single JWT part (header or payload).
 *
 * Throws with a specific message when Base64url decoding or JSON
 * parsing fails so the UI can display actionable errors.
 */
export function parseJsonPart(raw: string, partName: string): JwtDecodedPart {
  let decoded: string
  try {
    decoded = base64UrlDecode(raw)
  } catch {
    throw new Error(`Invalid JWT: invalid ${partName} encoding`)
  }

  let json: unknown | null = null
  let formatted: string
  try {
    json = JSON.parse(decoded)
    formatted = JSON.stringify(json, null, 2)
  } catch {
    throw new Error(`Invalid JWT: invalid ${partName} JSON`)
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
  const header = parseJsonPart(parts.header, 'header')
  const payload = parseJsonPart(parts.payload, 'payload')
  const payloadInfo = extractPayloadInfo(payload.json)
  const output = formatJwtOutput({ header, payload, signature: parts.signature }, payloadInfo)

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

/**
 * Build the structured output text shown in the output panel and
 * copied by "Copy Result".
 */
export function formatJwtOutput(
  parts: {
    header: JwtDecodedPart
    payload: JwtDecodedPart
    signature: string
  },
  info: JwtPayloadInfo,
): string {
  const sections: string[] = [
    'Header',
    parts.header.formatted,
    '',
    'Payload',
    parts.payload.formatted,
  ]

  // Registered Claims — only show when at least one time claim exists
  if (info.exp || info.iat || info.nbf) {
    sections.push('', 'Registered Claims')
    if (info.iat) {
      sections.push(`iat: ${info.iat.local}`)
    }
    if (info.nbf) {
      sections.push(`nbf: ${info.nbf.local}`)
    }
    if (info.exp) {
      const status = info.exp.expired ? 'expired' : 'active'
      sections.push(`exp: ${info.exp.local} (${status})`)
    }
  }

  sections.push('', 'Signature', parts.signature)
  return sections.join('\n')
}

// ── Validation ──────────────────────────────────────────────────────

export function validateJwtInput(input: string): JwtValidationResult {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'EMPTY_INPUT', message: 'Invalid JWT: token is empty' }],
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
          message: 'Invalid JWT: expected 3 parts',
        },
      ],
    }
  }

  // Pre-validate header Base64url decoding
  try {
    base64UrlDecode(parts[0])
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_HEADER', message: 'Invalid JWT: invalid header encoding' },
      ],
    }
  }

  // Pre-validate header JSON
  try {
    JSON.parse(base64UrlDecode(parts[0]))
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_HEADER_JSON', message: 'Invalid JWT: invalid header JSON' },
      ],
    }
  }

  // Pre-validate payload Base64url decoding
  try {
    base64UrlDecode(parts[1])
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_PAYLOAD', message: 'Invalid JWT: invalid payload encoding' },
      ],
    }
  }

  // Pre-validate payload JSON
  try {
    JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    return {
      valid: false,
      errors: [
        { field: 'input', code: 'INVALID_PAYLOAD_JSON', message: 'Invalid JWT: invalid payload JSON' },
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
