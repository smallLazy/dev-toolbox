/**
 * FeatureClipboard — Clipboard abstraction for Features.
 *
 * Each Feature has its own clipboard scope.
 * Features NEVER access the system clipboard directly.
 */

export interface FeatureClipboard {
  /** Copy text to clipboard */
  copy(text: string): Promise<void>

  /** Read text from clipboard */
  paste(): Promise<string>

  /** Copy current input to clipboard */
  copyInput(): Promise<void>

  /** Copy current output to clipboard */
  copyOutput(): Promise<void>

  /** Paste clipboard content into input */
  pasteInput(): Promise<void>
}

/**
 * Create a FeatureClipboard backed by the Web Clipboard API.
 * For Tauri, replace with Tauri clipboard plugin calls.
 */
export function createWebClipboard(): FeatureClipboard {
  let inputCache = ''
  let outputCache = ''

  return {
    async copy(text: string): Promise<void> {
      await navigator.clipboard.writeText(text)
      outputCache = text
    },

    async paste(): Promise<string> {
      try {
        const text = await navigator.clipboard.readText()
        inputCache = text
        return text
      } catch {
        return ''
      }
    },

    async copyInput(): Promise<void> {
      await navigator.clipboard.writeText(inputCache)
    },

    async copyOutput(): Promise<void> {
      if (outputCache) {
        await navigator.clipboard.writeText(outputCache)
      }
    },

    async pasteInput(): Promise<void> {
      try {
        inputCache = await navigator.clipboard.readText()
      } catch {
        // clipboard empty or denied
      }
    },
  }
}
