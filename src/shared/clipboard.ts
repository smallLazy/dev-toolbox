/**
 * Shared Clipboard Helper
 *
 * Unified copyText function used by all Feature composables.
 * Replaces the previous per-composable inline navigator.clipboard.writeText calls.
 *
 * Priority:
 *   1. navigator.clipboard.writeText (modern async API)
 *   2. textarea + document.execCommand('copy') fallback (legacy/Tauri)
 *
 * Compatible with: browser, Tauri WebView, Vitest (jsdom)
 */

/**
 * Copy text to the system clipboard.
 *
 * @param text - The text to copy (empty string is allowed; caller decides validity)
 * @throws Error if clipboard is unavailable or copy fails
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // Fallback: legacy execCommand('copy') via temporary textarea
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'

  document.body.appendChild(textarea)

  try {
    textarea.focus()
    textarea.select()

    const copied = document.execCommand('copy')
    if (!copied) {
      throw new Error('Clipboard copy is not available')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}
