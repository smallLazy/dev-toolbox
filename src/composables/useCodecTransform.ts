/**
 * useCodecTransform — Shared encode/decode interaction state machine
 *
 * Extracted from Base64 and URL (PHP Codec) plugins to fix a common bug:
 * switching Encode/Decode tabs only updated the mode ref but did NOT
 * re-transform the current input — requiring a second click.
 *
 * This composable ensures selectMode(nextMode) always calls
 * transform(nextMode) explicitly, never relying on the async
 * reactivity of mode.value.
 *
 * Scope: interaction state only (mode, input, output, error).
 * Encode/decode functions are passed in — this composable knows
 * nothing about Base64, URL, PHP, or any specific algorithm.
 */

import { ref, type Ref } from 'vue'

export type CodecMode = 'encode' | 'decode'

export interface UseCodecTransformOptions {
  /** Encode function: input → output. Must throw on invalid input. */
  encode: (input: string) => string
  /** Decode function: input → output. Must throw on invalid input. */
  decode: (input: string) => string
  /** Initial mode. Defaults to 'encode'. */
  defaultMode?: CodecMode
}

export interface UseCodecTransformReturn {
  input: Ref<string>
  output: Ref<string | null>
  error: Ref<string | null>
  mode: Ref<CodecMode>

  /**
   * Switch mode and immediately transform the current input.
   *
   * KEY GUARANTEE: calls transform(nextMode) with the explicit
   * nextMode argument — does NOT rely on mode.value having been
   * updated asynchronously by Vue reactivity.
   */
  selectMode: (nextMode: CodecMode) => void

  /**
   * Transform current input using the given targetMode.
   *
   * Does NOT read mode.value. The caller decides which function
   * to use. This means it works correctly even when called before
   * Vue has flushed a mode.value change to the DOM.
   *
   * Rules:
   * - Empty input → output=null, error=null (no error for empty)
   * - Transform succeeds → output=result, error=null
   * - Transform throws → output=null, error=message
   */
  transform: (targetMode: CodecMode) => void

  /** Clear input, output, and error. Does NOT change mode. */
  clear: () => void
}

export function useCodecTransform(options: UseCodecTransformOptions): UseCodecTransformReturn {
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const mode = ref<CodecMode>(options.defaultMode ?? 'encode')

  function transform(targetMode: CodecMode): void {
    error.value = null
    output.value = null

    // Empty input is not an error — just clear output silently
    if (!input.value) {
      return
    }

    const fn = targetMode === 'encode' ? options.encode : options.decode

    try {
      output.value = fn(input.value)
    } catch (e) {
      error.value = (e as Error).message || 'Transform failed'
      output.value = null
    }
  }

  function selectMode(nextMode: CodecMode): void {
    mode.value = nextMode
    // Explicit nextMode argument — never reads mode.value
    transform(nextMode)
  }

  function clear(): void {
    input.value = ''
    output.value = null
    error.value = null
  }

  return {
    input,
    output,
    error,
    mode,
    selectMode,
    transform,
    clear,
  }
}
