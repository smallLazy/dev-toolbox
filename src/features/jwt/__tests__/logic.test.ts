/**
 * JWT Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  splitJwt,
  base64UrlToBase64,
  base64UrlDecode,
  parseJsonPart,
  parseNumericDate,
  extractPayloadInfo,
  decodeJwt,
  validateJwtInput,
  getStats,
} from '../logic'

// Sample JWT: {"alg":"HS256","typ":"JWT"}.{"sub":"123","name":"Test","iat":1516239022}.sig
const SAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiVGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.abc123signature'

// ── splitJwt ────────────────────────────────────────────────────────

describe('splitJwt', () => {
  it('splits a valid 3-part JWT', () => {
    const parts = splitJwt(SAMPLE_TOKEN)
    expect(parts.header).toBeTruthy()
    expect(parts.payload).toBeTruthy()
    expect(parts.signature).toBe('abc123signature')
  })

  it('throws on 2-part token', () => {
    expect(() => splitJwt('a.b')).toThrow('3 parts')
  })

  it('throws on 4-part token', () => {
    expect(() => splitJwt('a.b.c.d')).toThrow('3 parts')
  })

  it('throws on empty string', () => {
    expect(() => splitJwt('')).toThrow('3 parts')
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
    const part = parseJsonPart('eyJhbGciOiJIUzI1NiJ9')
    expect(part.json).toEqual({ alg: 'HS256' })
    expect(part.formatted).toContain('"alg"')
  })

  it('returns decoded text when not valid JSON', () => {
    const part = parseJsonPart('bm90LWpzb24') // "not-json"
    expect(part.json).toBeNull()
    expect(part.formatted).toBe('not-json')
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

  it('marks future dates as not expired', () => {
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
    expect(result.output).toContain('Header:')
    expect(result.output).toContain('Payload:')
    expect(result.output).toContain('Signature:')
  })
})

// ── validateJwtInput ─────────────────────────────────────────────────

describe('validateJwtInput', () => {
  it('rejects empty input', () => {
    const r = validateJwtInput('')
    expect(r.valid).toBe(false)
  })

  it('rejects 2-part token', () => {
    const r = validateJwtInput('a.b')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('INVALID_FORMAT')
  })

  it('rejects invalid header Base64url', () => {
    const r = validateJwtInput('!!!.eyJzdWIiOiIxMjMifQ.sig')
    expect(r.valid).toBe(false)
  })

  it('rejects invalid payload Base64url', () => {
    const r = validateJwtInput('eyJhbGciOiJIUzI1NiJ9.!!!.sig')
    expect(r.valid).toBe(false)
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
