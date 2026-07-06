/**
 * JWT Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  EXAMPLE_JWT,
  splitJwt,
  base64UrlToBase64,
  base64UrlDecode,
  parseJsonPart,
  parseNumericDate,
  extractPayloadInfo,
  decodeJwt,
  formatJwtOutput,
  validateJwtInput,
  getStats,
} from '../logic'

// Sample JWT: {"alg":"HS256","typ":"JWT"}.{"sub":"123","name":"Test","iat":1516239022}.sig
const SAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiVGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.abc123signature'

// ── EXAMPLE_JWT ─────────────────────────────────────────────────────

describe('EXAMPLE_JWT', () => {
  it('can be decoded successfully', () => {
    const result = decodeJwt(EXAMPLE_JWT)
    expect(result.header.json).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(result.payload.json).toHaveProperty('sub', '1234567890')
    expect(result.payload.json).toHaveProperty('name', 'Dev Toolbox')
    expect(result.signature).toBe('example-signature')
  })

  it('has valid base64url header and payload', () => {
    const parts = EXAMPLE_JWT.split('.')
    expect(() => base64UrlDecode(parts[0])).not.toThrow()
    expect(() => base64UrlDecode(parts[1])).not.toThrow()
  })

  it('payload contains iat and exp', () => {
    const result = decodeJwt(EXAMPLE_JWT)
    expect(result.payloadInfo.iat).toBeDefined()
    expect(result.payloadInfo.exp).toBeDefined()
    expect(result.payloadInfo.iat!.value).toBe(1710000000)
    expect(result.payloadInfo.exp!.value).toBe(1893456000)
  })
})

// ── splitJwt ────────────────────────────────────────────────────────

describe('splitJwt', () => {
  it('splits a valid 3-part JWT', () => {
    const parts = splitJwt(SAMPLE_TOKEN)
    expect(parts.header).toBeTruthy()
    expect(parts.payload).toBeTruthy()
    expect(parts.signature).toBe('abc123signature')
  })

  it('throws on 2-part token', () => {
    expect(() => splitJwt('a.b')).toThrow('expected 3 parts')
  })

  it('throws on 4-part token', () => {
    expect(() => splitJwt('a.b.c.d')).toThrow('expected 3 parts')
  })

  it('throws on empty string', () => {
    expect(() => splitJwt('')).toThrow('expected 3 parts')
  })
})

// ── base64url ────────────────────────────────────────────────────────

describe('base64UrlToBase64', () => {
  it('replaces - with + and _ with /', () => {
    const result = base64UrlToBase64('a-b_c')
    expect(result.startsWith('a+b/c')).toBe(true)
    expect(result.replace(/=/g, '')).toBe('a+b/c')
  })

  it('auto-pads to multiple of 4', () => {
    expect(base64UrlToBase64('abc')).toBe('abc=')
    expect(base64UrlToBase64('ab')).toBe('ab==')
  })
})

describe('base64UrlDecode', () => {
  it('decodes standard Base64url header', () => {
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    const decoded = base64UrlDecode(header)
    expect(decoded).toContain('HS256')
  })

  it('decodes payload with UTF-8 content', () => {
    const payload = base64UrlDecode('eyJuYW1lIjoiVGVzdCJ9')
    expect(payload).toBe('{"name":"Test"}')
  })
})

// ── parseJsonPart ────────────────────────────────────────────────────

describe('parseJsonPart', () => {
  it('parses valid JSON from Base64url', () => {
    const part = parseJsonPart('eyJhbGciOiJIUzI1NiJ9', 'header')
    expect(part.json).toEqual({ alg: 'HS256' })
    expect(part.formatted).toContain('"alg"')
  })

  it('throws on invalid Base64url encoding', () => {
    expect(() => parseJsonPart('!!!', 'header')).toThrow('invalid header encoding')
    expect(() => parseJsonPart('!!!', 'payload')).toThrow('invalid payload encoding')
  })

  it('throws on invalid JSON after decoding', () => {
    // "not-json" in base64url
    const notJson = 'bm90LWpzb24'
    expect(() => parseJsonPart(notJson, 'header')).toThrow('invalid header JSON')
    expect(() => parseJsonPart(notJson, 'payload')).toThrow('invalid payload JSON')
  })
})

// ── Claims ───────────────────────────────────────────────────────────

describe('parseNumericDate', () => {
  it('returns undefined for non-number', () => {
    expect(parseNumericDate('abc')).toBeUndefined()
  })

  it('parses numeric date', () => {
    const claim = parseNumericDate(1516239022)
    expect(claim).toBeDefined()
    expect(claim!.iso).toContain('2018-01')
    expect(claim!.expired).toBe(true) // past date
  })

  it('marks future dates as not expired (active)', () => {
    const future = Math.floor(Date.now() / 1000) + 86400
    const claim = parseNumericDate(future)
    expect(claim!.expired).toBe(false)
  })
})

describe('extractPayloadInfo', () => {
  it('extracts exp, iat, nbf from payload object', () => {
    const info = extractPayloadInfo({ exp: 1516239022, iat: 1516239022, nbf: 1516239022 })
    expect(info.exp).toBeDefined()
    expect(info.iat).toBeDefined()
    expect(info.nbf).toBeDefined()
  })

  it('returns empty object for non-object payload', () => {
    expect(extractPayloadInfo(null)).toEqual({})
    expect(extractPayloadInfo('string')).toEqual({})
  })
})

// ── decodeJwt ────────────────────────────────────────────────────────

describe('decodeJwt', () => {
  it('decodes a full JWT', () => {
    const result = decodeJwt(SAMPLE_TOKEN)
    expect(result.header.json).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(result.payload.json).toHaveProperty('sub', '123')
    expect(result.signature).toBe('abc123signature')
    expect(result.output).toContain('Header')
    expect(result.output).toContain('Payload')
    expect(result.output).toContain('Signature')
  })

  it('throws on invalid header encoding', () => {
    const badToken = '!!!.eyJzdWIiOiIxMjMifQ.sig'
    expect(() => decodeJwt(badToken)).toThrow('invalid header encoding')
  })

  it('throws on invalid payload encoding', () => {
    const badToken = 'eyJhbGciOiJIUzI1NiJ9.!!!.sig'
    expect(() => decodeJwt(badToken)).toThrow('invalid payload encoding')
  })

  it('throws on invalid header JSON', () => {
    const badToken = 'bm90LWpzb24.eyJzdWIiOiIxMjMifQ.sig'
    expect(() => decodeJwt(badToken)).toThrow('invalid header JSON')
  })

  it('throws on invalid payload JSON', () => {
    const badToken = 'eyJhbGciOiJIUzI1NiJ9.bm90LWpzb24.sig'
    expect(() => decodeJwt(badToken)).toThrow('invalid payload JSON')
  })

  it('output includes Registered Claims when time claims exist', () => {
    const result = decodeJwt(EXAMPLE_JWT)
    expect(result.output).toContain('Registered Claims')
    expect(result.output).toContain('iat:')
    expect(result.output).toContain('exp:')
    expect(result.output).toContain('active')
  })

  it('output excludes Registered Claims when no time claims', () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sig'
    const result = decodeJwt(token)
    expect(result.output).not.toContain('Registered Claims')
  })
})

// ── formatJwtOutput ──────────────────────────────────────────────────

describe('formatJwtOutput', () => {
  it('includes all four sections', () => {
    const header = parseJsonPart('eyJhbGciOiJIUzI1NiJ9', 'header')
    const payload = parseJsonPart('eyJzdWIiOiIxMjMifQ', 'payload')
    const info = extractPayloadInfo(payload.json)
    const output = formatJwtOutput({ header, payload, signature: 'sig123' }, info)
    expect(output).toContain('Header')
    expect(output).toContain('Payload')
    expect(output).toContain('Signature')
    expect(output).toContain('sig123')
    // No time claims → no Registered Claims
    expect(output).not.toContain('Registered Claims')
  })

  it('includes Registered Claims when exp is present', () => {
    const payload = parseJsonPart('eyJleHAiOjE4OTM0NTYwMDB9', 'payload') // {"exp":1893456000}
    const info = extractPayloadInfo(payload.json)
    const output = formatJwtOutput(
      {
        header: parseJsonPart('eyJhbGciOiJIUzI1NiJ9', 'header'),
        payload,
        signature: 'sig',
      },
      info,
    )
    expect(output).toContain('Registered Claims')
    expect(output).toContain('exp:')
    expect(output).toContain('active')
  })

  it('shows expired for past exp', () => {
    const payload = parseJsonPart('eyJleHAiOjE1MTYyMzkwMjJ9', 'payload') // {"exp":1516239022}
    const info = extractPayloadInfo(payload.json)
    const output = formatJwtOutput(
      {
        header: parseJsonPart('eyJhbGciOiJIUzI1NiJ9', 'header'),
        payload,
        signature: 'sig',
      },
      info,
    )
    expect(output).toContain('expired')
  })

  it('includes iat and nbf in Registered Claims', () => {
    const payloadData = JSON.stringify({ iat: 1710000000, nbf: 1710000000 })
    const payloadB64 = btoa(payloadData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const payload = parseJsonPart(payloadB64, 'payload')
    const info = extractPayloadInfo(payload.json)
    const output = formatJwtOutput(
      {
        header: parseJsonPart('eyJhbGciOiJIUzI1NiJ9', 'header'),
        payload,
        signature: 'sig',
      },
      info,
    )
    expect(output).toContain('iat:')
    expect(output).toContain('nbf:')
  })
})

// ── validateJwtInput ─────────────────────────────────────────────────

describe('validateJwtInput', () => {
  it('rejects empty input', () => {
    const r = validateJwtInput('')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].message).toBe('Invalid JWT: token is empty')
  })

  it('rejects 2-part token', () => {
    const r = validateJwtInput('a.b')
    expect(r.valid).toBe(false)
    if (!r.valid) {
      expect(r.errors[0].code).toBe('INVALID_FORMAT')
      expect(r.errors[0].message).toBe('Invalid JWT: expected 3 parts')
    }
  })

  it('rejects invalid header Base64url', () => {
    const r = validateJwtInput('!!!.eyJzdWIiOiIxMjMifQ.sig')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].message).toBe('Invalid JWT: invalid header encoding')
  })

  it('rejects invalid payload Base64url', () => {
    const r = validateJwtInput('eyJhbGciOiJIUzI1NiJ9.!!!.sig')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].message).toBe('Invalid JWT: invalid payload encoding')
  })

  it('rejects invalid header JSON', () => {
    const r = validateJwtInput('bm90LWpzb24.eyJzdWIiOiIxMjMifQ.sig')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].message).toBe('Invalid JWT: invalid header JSON')
  })

  it('rejects invalid payload JSON', () => {
    const r = validateJwtInput('eyJhbGciOiJIUzI1NiJ9.bm90LWpzb24.sig')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].message).toBe('Invalid JWT: invalid payload JSON')
  })

  it('accepts a valid JWT', () => {
    expect(validateJwtInput(SAMPLE_TOKEN).valid).toBe(true)
  })
})

// ── getStats ─────────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns chars, bytes, lines', () => {
    const s = getStats('hello\nworld')
    expect(s.chars).toBe(11)
    expect(s.lines).toBe(2)
    expect(s.bytes).toBe(11)
  })
})
