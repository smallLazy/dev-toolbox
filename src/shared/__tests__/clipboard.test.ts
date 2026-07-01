/**
 * Shared Clipboard Helper — Unit Tests
 *
 * Tests copyText across both paths:
 *   1. navigator.clipboard.writeText (modern)
 *   2. textarea + execCommand('copy') fallback (legacy)
 *
 * No jsdom dependency — document is stubbed via vi.stubGlobal.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyText } from '../clipboard'

// ── Helpers ──────────────────────────────────────────────────────────

/** Mock navigator.clipboard.writeText */
function mockClipboardAPI(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  })
}

/** Remove navigator.clipboard entirely */
function removeClipboardAPI() {
  Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true,
    writable: true,
  })
}

/**
 * Set up a minimal stub of document.createElement, body.appendChild/removeChild,
 * and execCommand for testing the fallback path.
 */
function stubDocumentForFallback(execCommandReturn: boolean) {
  const textareas: HTMLTextAreaElement[] = []
  const bodyChildren: Node[] = []

  // Minimal HTMLElement stub
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeDoc: any = {
    createElement: vi.fn((_tag: string) => {
      const el = {
        value: '',
        setAttribute: vi.fn(),
        style: {} as Record<string, string>,
        focus: vi.fn(),
        select: vi.fn(),
      }
      textareas.push(el as unknown as HTMLTextAreaElement)
      return el
    }),
    body: {
      appendChild: vi.fn((node: Node) => {
        bodyChildren.push(node)
        return node
      }),
      removeChild: vi.fn((node: Node) => {
        const idx = bodyChildren.indexOf(node)
        if (idx !== -1) bodyChildren.splice(idx, 1)
        return node
      }),
    },
    execCommand: vi.fn().mockReturnValue(execCommandReturn),
  }

  vi.stubGlobal('document', fakeDoc)

  return {
    textareas,
    bodyChildren,
    execSpy: fakeDoc.execCommand as ReturnType<typeof vi.fn>,
    appendSpy: fakeDoc.body.appendChild as ReturnType<typeof vi.fn>,
    removeSpy: fakeDoc.body.removeChild as ReturnType<typeof vi.fn>,
  }
}

// ── Save / restore globals ───────────────────────────────────────────

let originalClipboard: Clipboard | undefined

beforeEach(() => {
  originalClipboard = navigator.clipboard
})

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: originalClipboard,
    configurable: true,
    writable: true,
  })
  vi.unstubAllGlobals()
})

// ── navigator.clipboard path ─────────────────────────────────────────

describe('copyText via navigator.clipboard', () => {
  it('calls navigator.clipboard.writeText with the text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboardAPI(writeText)

    await copyText('hello')

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('rejects when navigator.clipboard.writeText throws', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    mockClipboardAPI(writeText)

    await expect(copyText('hello')).rejects.toThrow('Permission denied')
  })

  it('allows empty string via clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboardAPI(writeText)

    await copyText('')

    expect(writeText).toHaveBeenCalledWith('')
  })
})

// ── Fallback path (no navigator.clipboard) ───────────────────────────

describe('copyText fallback (execCommand)', () => {
  it('uses fallback when navigator.clipboard is absent', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(true)

    await copyText('hello')

    expect(doc.execSpy).toHaveBeenCalledWith('copy')
  })

  it('creates a textarea with the correct value', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(true)

    await copyText('hello world')

    expect(doc.textareas.length).toBe(1)
    expect(doc.textareas[0].value).toBe('hello world')
  })

  it('removes the textarea after copy (cleanup)', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(true)

    await copyText('hello')

    // removeChild should have been called
    expect(doc.removeSpy).toHaveBeenCalled()
  })

  it('rejects when execCommand returns false', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(false)

    await expect(copyText('hello')).rejects.toThrow('Clipboard copy is not available')

    // cleanup should still have happened through finally block
    expect(doc.removeSpy).toHaveBeenCalled()
  })

  it('cleans up textarea even when execCommand fails', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(false)

    await expect(copyText('hello')).rejects.toThrow()

    // removeChild should have been called in the finally block
    expect(doc.removeSpy).toHaveBeenCalled()
  })

  it('allows empty string via fallback', async () => {
    removeClipboardAPI()
    const doc = stubDocumentForFallback(true)

    await copyText('')

    expect(doc.textareas.length).toBe(1)
    expect(doc.textareas[0].value).toBe('')
  })
})

// ── Edge: navigator.clipboard exists but writeText is missing ─────────

describe('copyText edge cases', () => {
  it('falls back when navigator.clipboard exists but writeText is null', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: undefined },
      configurable: true,
      writable: true,
    })
    const doc = stubDocumentForFallback(true)

    await copyText('hello')

    expect(doc.execSpy).toHaveBeenCalledWith('copy')
  })
})
