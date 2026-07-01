/**
 * Hash Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 */

import type {
  HashAlgorithm,
  HashConfig,
  HashResult,
  HashValidationResult,
  HashValidationError,
  TextStats,
} from './types'

// ── MD5 (RFC 1321) ──────────────────────────────────────────────────

/** MD5 auxiliary functions */
function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  const added = (a + q + x + t) | 0
  return (((added << s) | (added >>> (32 - s))) + b) | 0
}

function ff(
  a: number, b: number, c: number, d: number,
  x: number, s: number, t: number,
): number {
  return cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function gg(
  a: number, b: number, c: number, d: number,
  x: number, s: number, t: number,
): number {
  return cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function hh(
  a: number, b: number, c: number, d: number,
  x: number, s: number, t: number,
): number {
  return cmn(b ^ c ^ d, a, b, x, s, t)
}

function ii(
  a: number, b: number, c: number, d: number,
  x: number, s: number, t: number,
): number {
  return cmn(c ^ (b | (~d)), a, b, x, s, t)
}

function md5cycle(state: Int32Array, block: Int32Array): void {
  let a = state[0], b = state[1], c = state[2], d = state[3]

  a = ff(a, b, c, d, block[0],  7,  -680876936); d = ff(d, a, b, c, block[1],  12, -389564586)
  c = ff(c, d, a, b, block[2],  17,  606105819); b = ff(b, c, d, a, block[3],  22, -1044525330)
  a = ff(a, b, c, d, block[4],  7,  -176418897); d = ff(d, a, b, c, block[5],  12,  1200080426)
  c = ff(c, d, a, b, block[6],  17, -1473231341); b = ff(b, c, d, a, block[7],  22, -45705983)
  a = ff(a, b, c, d, block[8],  7,   1770035416); d = ff(d, a, b, c, block[9],  12, -1958414417)
  c = ff(c, d, a, b, block[10], 17, -42063);       b = ff(b, c, d, a, block[11], 22, -1990404162)
  a = ff(a, b, c, d, block[12], 7,   1804603682); d = ff(d, a, b, c, block[13], 12, -40341101)
  c = ff(c, d, a, b, block[14], 17, -1502002290); b = ff(b, c, d, a, block[15], 22,  1236535329)

  a = gg(a, b, c, d, block[1],  5,  -165796510); d = gg(d, a, b, c, block[6],  9,  -1069501632)
  c = gg(c, d, a, b, block[11], 14,  643717713); b = gg(b, c, d, a, block[0],  20, -373897302)
  a = gg(a, b, c, d, block[5],  5,  -701558691); d = gg(d, a, b, c, block[10], 9,   38016083)
  c = gg(c, d, a, b, block[15], 14, -660478335); b = gg(b, c, d, a, block[4],  20, -405537848)
  a = gg(a, b, c, d, block[9],  5,   568446438); d = gg(d, a, b, c, block[14], 9,  -1019803690)
  c = gg(c, d, a, b, block[3],  14, -187363961); b = gg(b, c, d, a, block[8],  20,  1163531501)
  a = gg(a, b, c, d, block[13], 5,  -1444681467); d = gg(d, a, b, c, block[2],  9,  -51403784)
  c = gg(c, d, a, b, block[7],  14,  1735328473); b = gg(b, c, d, a, block[12], 20, -1926607734)

  a = hh(a, b, c, d, block[5],  4,  -378558);     d = hh(d, a, b, c, block[8],  11, -2022574463)
  c = hh(c, d, a, b, block[11], 16,  1839030562); b = hh(b, c, d, a, block[14], 23, -35309556)
  a = hh(a, b, c, d, block[1],  4,  -1530992060); d = hh(d, a, b, c, block[4],  11,  1272893353)
  c = hh(c, d, a, b, block[7],  16, -155497632);  b = hh(b, c, d, a, block[10], 23, -1094730640)
  a = hh(a, b, c, d, block[13], 4,   681279174);  d = hh(d, a, b, c, block[0],  11, -358537222)
  c = hh(c, d, a, b, block[3],  16, -722521979);  b = hh(b, c, d, a, block[6],  23,  76029189)
  a = hh(a, b, c, d, block[9],  4,  -640364487);  d = hh(d, a, b, c, block[12], 11, -421815835)
  c = hh(c, d, a, b, block[15], 16,  530742520);  b = hh(b, c, d, a, block[2],  23, -995338651)

  a = ii(a, b, c, d, block[0],  6,  -198630844); d = ii(d, a, b, c, block[7],  10,  1126891415)
  c = ii(c, d, a, b, block[14], 15, -1416354905); b = ii(b, c, d, a, block[5],  21, -57434055)
  a = ii(a, b, c, d, block[12], 6,   1700485571); d = ii(d, a, b, c, block[3],  10, -1894986606)
  c = ii(c, d, a, b, block[10], 15, -1051523);    b = ii(b, c, d, a, block[1],  21, -2054922799)
  a = ii(a, b, c, d, block[8],  6,   1873313359); d = ii(d, a, b, c, block[15], 10, -30611744)
  c = ii(c, d, a, b, block[6],  15, -1560198380); b = ii(b, c, d, a, block[13], 21,  1309151649)
  a = ii(a, b, c, d, block[4],  6,  -145523070);  d = ii(d, a, b, c, block[11], 10, -1120210379)
  c = ii(c, d, a, b, block[2],  15,  718787259);  b = ii(b, c, d, a, block[9],  21, -343485551)

  state[0] = (state[0] + a) | 0
  state[1] = (state[1] + b) | 0
  state[2] = (state[2] + c) | 0
  state[3] = (state[3] + d) | 0
}

/**
 * Compute MD5 hash of a string.
 *
 * Pure JS implementation of RFC 1321.
 * Output: 32-character lowercase hex string.
 */
export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const len = bytes.length
  // Pad to 64-byte boundary + 64 bytes (for the length trailer)
  const paddedLen = (((len + 8) >>> 6) + 1) * 64
  const padded = new Uint8Array(paddedLen)
  padded.set(bytes)
  padded[len] = 0x80

  // Append bit-length as 64-bit little-endian
  const bitLen = len * 8
  const view = new DataView(padded.buffer)
  view.setUint32(paddedLen - 8, bitLen >>> 0, true)  // low 32 bits
  view.setUint32(paddedLen - 4, (bitLen / 0x100000000) >>> 0, true) // high 32 bits

  const state = new Int32Array([1732584193, -271733879, -1732584194, 271733878])

  for (let i = 0; i < paddedLen; i += 64) {
    const block = new Int32Array(16)
    for (let j = 0; j < 16; j++) {
      block[j] = view.getInt32(i + j * 4, true)
    }
    md5cycle(state, block)
  }

  // Convert state to hex
  const out = new Uint8Array(16)
  const outView = new DataView(out.buffer)
  for (let i = 0; i < 4; i++) {
    outView.setInt32(i * 4, state[i], true)
  }
  return Array.from(out)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── SHA-256 (Web Crypto) ────────────────────────────────────────────

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 *
 * Output: 64-character lowercase hex string.
 */
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── Main hash dispatch ──────────────────────────────────────────────

/**
 * Hash input using the specified algorithm.
 */
export async function hashText(
  input: string,
  config: HashConfig,
): Promise<HashResult> {
  let output: string

  if (config.algorithm === 'sha256') {
    output = await sha256(input)
  } else {
    output = md5(input)
  }

  return { input, output, config }
}

// ── Validation ──────────────────────────────────────────────────────

/**
 * Validate user input before hashing.
 *
 * Checks: empty/whitespace input, maximum size.
 */
export function validateHashInput(input: string): HashValidationResult {
  const errors: HashValidationError[] = []

  const trimmed = input.trim()
  if (trimmed.length === 0) {
    errors.push({
      field: 'input',
      code: 'EMPTY_INPUT',
      message: 'Input is empty',
    })
  }

  const bytes = new TextEncoder().encode(input).length
  const MAX_SIZE = 50 * 1024 * 1024
  if (bytes > MAX_SIZE) {
    errors.push({
      field: 'input',
      code: 'INPUT_TOO_LARGE',
      message: 'Input exceeds maximum size of 50MB',
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

// ── Statistics ──────────────────────────────────────────────────────

/**
 * Get statistics about the input string.
 */
export function getStats(input: string): TextStats {
  return {
    chars: input.length,
    lines: input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}

/**
 * Format byte count for display (e.g. "1.2 KB").
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
