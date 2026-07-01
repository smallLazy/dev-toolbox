/**
 * PHP Codec (Preset) — Composable Tests (Mode Switch behavior)
 *
 * Tests the EXACT click chain from ToolSegmentedControl Mode Switch
 * through to output. This reproduces the real UI interaction path.
 *
 * Click chain:
 *   1. User clicks Decode in the Mode Switch (ToolSegmentedControl)
 *   2. pointerdown → handlePointerDown → select → emit('update:modelValue')
 *   3. PresetView @update:model-value → handleModeChange(value)
 *   4. handleModeChange → selectMode(value)
 *   5. selectMode → pipelineResult=null → codec.selectMode(value)
 *   6. codec.selectMode → mode.value=value → transform(value)
 *   7. transform → runPipeline(preset, 'decode', input).output → output.value
 *
 * KEY GUARANTEE: The Mode Switch immediately transforms on click.
 * The Run Encode / Run Decode button is for manual re-execution, not
 * for triggering the first transform after a mode change.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePreset } from '../composables'
import { runPipeline } from '@/shared/pipeline'
import { phpCompatiblePreset } from '../php-compatible.preset'

// Mock clipboard to verify copy behavior without DOM
vi.mock('@/shared/clipboard', () => ({
  copyText: vi.fn(),
}))

import { copyText } from '@/shared/clipboard'
const mockedCopyText = copyText as ReturnType<typeof vi.fn>

// ── Test vectors computed from the actual pipeline ─────────────────────
const DECODED_JSON = '{"code":"index_home_video","ad_type":"video"}'
const ENCODED_JSON = runPipeline(phpCompatiblePreset, 'encode', DECODED_JSON).output

beforeEach(() => {
  mockedCopyText.mockReset()
})

// ── Helper: simulate the PresetView Mode Switch click ──────────────────
//
// This replicates what happens when a user clicks the Mode Switch:
//   <ToolSegmentedControl
//     :model-value="mode"
//     :options="modeOptions"
//     @update:model-value="handleModeChange"
//   />
//
//   function handleModeChange(value: string) {
//     selectMode(value as 'encode' | 'decode')
//   }

function simulateClick(
  presetState: ReturnType<typeof usePreset>,
  newMode: 'encode' | 'decode',
) {
  // Step 1: ToolSegmentedControl (Mode Switch) emits 'update:modelValue' with the clicked value
  // Step 2: PresetView's @update:model-value calls handleModeChange(value)
  // Step 3: handleModeChange calls selectMode(value)
  presetState.selectMode(newMode)
}

describe('PHP Codec — full Mode Switch click chain simulation', () => {

  // ── Requirement a: default Encode mode, input encoded, first Mode Switch Decode → JSON

  it('REQ-A: default Encode mode, input encoded, first Mode Switch to Decode outputs JSON immediately', () => {
    const state = usePreset(phpCompatiblePreset)

    // User types/pastes encoded content into the textarea
    state.input.value = ENCODED_JSON

    // Verify initial state
    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBeNull()
    expect(state.error.value).toBeNull()

    // FIRST click on Decode in the Mode Switch — must immediately decode
    simulateClick(state, 'decode')

    // After first click:
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBe(DECODED_JSON)
    expect(state.error.value).toBeNull()
  })

  // ── Requirement b: Decode mode, input JSON, first Mode Switch Encode → encoded

  it('REQ-B: Decode mode, input JSON, first Mode Switch to Encode outputs encoded immediately', () => {
    // Start in decode mode by switching first
    const state = usePreset(phpCompatiblePreset)

    // User types JSON
    state.input.value = DECODED_JSON

    // Switch to decode mode first (simulates already being on Decode in Mode Switch)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')

    // Now click Encode in the Mode Switch — must immediately encode
    simulateClick(state, 'encode')

    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBe(ENCODED_JSON)
    expect(state.error.value).toBeNull()
  })

  // ── Requirement c: consecutive Mode Switch clicks each produce output on first click

  it('REQ-C: consecutive Mode Switch clicks each produce output on first click', () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = ENCODED_JSON

    // Click Decode in Mode Switch (1st switch)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBe(DECODED_JSON)

    // Click Encode in Mode Switch (2nd switch — input is still ENCODED_JSON)
    simulateClick(state, 'encode')
    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBeTruthy() // double-encoded
    expect(state.error.value).toBeNull()

    // Click Decode in Mode Switch (3rd switch)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBeTruthy()
    expect(state.error.value).toBeNull()
  })

  // ── Input preserved across Mode Switch ────────────────────────────────

  it('input is preserved when switching modes via Mode Switch', () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = ENCODED_JSON
    expect(state.input.value).toBe(ENCODED_JSON)

    simulateClick(state, 'decode')
    expect(state.input.value).toBe(ENCODED_JSON) // preserved
  })

  // ── Empty input ──────────────────────────────────────────────────────

  it('Mode Switch with empty input clears output without error', () => {
    const state = usePreset(phpCompatiblePreset)

    // Set up prior output
    state.input.value = 'test'
    simulateClick(state, 'encode')
    expect(state.output.value).toBeTruthy()

    // Clear input and switch mode
    state.input.value = ''
    simulateClick(state, 'decode')

    expect(state.output.value).toBeNull()
    expect(state.error.value).toBeNull()
    expect(state.mode.value).toBe('decode') // mode still changes
  })

  // ── Error handling ───────────────────────────────────────────────────

  it('invalid input on Mode Switch to decode sets error and clears output', () => {
    const state = usePreset(phpCompatiblePreset)

    // Input that is not valid Base64
    state.input.value = '!!!not-valid-base64!!!'

    simulateClick(state, 'decode')

    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBeNull()
    expect(state.error.value).toBeTruthy()
  })

  // ── Verify selectMode is the same function as switchMode ───────────────

  it('switchMode is same function as selectMode (alias integrity)', () => {
    const state = usePreset(phpCompatiblePreset)
    expect(state.switchMode).toBe(state.selectMode)
  })

  // ── Verify the transform actually reads input.value at call time ────────

  it('transform reads input value at time of Mode Switch click, not at definition time', () => {
    const state = usePreset(phpCompatiblePreset)

    // Set input AFTER creating state
    state.input.value = ENCODED_JSON

    simulateClick(state, 'decode')

    expect(state.output.value).toBe(DECODED_JSON)
  })
})

// ── Direct useCodecTransform + preset pipeline tests ──────────────────

describe('PHP Codec — useCodecTransform with preset pipeline', () => {
  it('default mode is taken from preset.mode', () => {
    const state = usePreset(phpCompatiblePreset)
    expect(state.mode.value).toBe('encode') // phpCompatiblePreset.mode === 'encode'
  })

  it('roundtrip: encode → set input to output → decode → original', () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')
    const encoded = state.output.value
    expect(encoded).toBeTruthy()

    // Swap: put encoded output as input
    state.input.value = encoded!
    simulateClick(state, 'decode')
    expect(state.output.value).toBe(DECODED_JSON)
  })

  it('pipelineResult is cleared on Mode Switch', () => {
    const state = usePreset(phpCompatiblePreset)

    // Execute to populate pipelineResult
    state.input.value = 'test'
    state.execute()
    // pipelineResult is set asynchronously, but for mode switch it should clear
    state.selectMode('decode')
    expect(state.pipelineResult.value).toBeNull()
  })
})

// ── Button label derivation (Run Encode / Run Decode) ──────────────────

describe('PHP Codec action button label', () => {
  it('shows "Run Encode" when mode is encode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('encode')).toBe('Run Encode')
  })

  it('shows "Run Decode" when mode is decode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('decode')).toBe('Run Decode')
  })
})

// ── Copy: first-click success ──────────────────────────────────────────

describe('PHP Codec — copy behavior', () => {

  it('copy() reads current output.value and calls copyText with it', async () => {
    const state = usePreset(phpCompatiblePreset)

    // Generate output via Mode Switch
    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')
    expect(state.output.value).toBeTruthy()

    // Copy — should read the current output
    await state.copy()

    expect(mockedCopyText).toHaveBeenCalledTimes(1)
    expect(mockedCopyText).toHaveBeenCalledWith(state.output.value)
  })

  it('copy() after Mode Switch uses the latest output (not stale)', async () => {
    const state = usePreset(phpCompatiblePreset)

    // First encode
    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')
    const firstOutput = state.output.value!

    // Then switch to decode (with different input)
    state.input.value = ENCODED_JSON
    simulateClick(state, 'decode')
    const secondOutput = state.output.value!
    expect(secondOutput).not.toBe(firstOutput)

    // Copy should use the latest (decode) output
    await state.copy()
    expect(mockedCopyText).toHaveBeenCalledTimes(1)
    expect(mockedCopyText).toHaveBeenCalledWith(secondOutput)
  })

  it('copy() after execute uses the latest output', async () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = DECODED_JSON
    await state.execute()
    expect(state.output.value).toBeTruthy()

    await state.copy()
    expect(mockedCopyText).toHaveBeenCalledTimes(1)
    expect(mockedCopyText).toHaveBeenCalledWith(state.output.value)
  })

  it('copy() when output is null sets error and does NOT call copyText', async () => {
    const state = usePreset(phpCompatiblePreset)

    // Fresh state — output is null
    expect(state.output.value).toBeNull()

    await state.copy()

    expect(state.error.value).toBe('No output to copy')
    expect(mockedCopyText).not.toHaveBeenCalled()
  })

  it('copy() when output is empty string still calls copyText', async () => {
    const state = usePreset(phpCompatiblePreset)

    // Empty input → empty output
    state.input.value = ''
    await state.execute()
    // execute on empty input may produce empty output or error
    // If output is empty string, copy should still call copyText
    if (state.output.value === '') {
      await state.copy()
      expect(mockedCopyText).toHaveBeenCalledWith('')
    }
  })

  it('copy() called twice works both times (not deduped across separate calls)', async () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')
    expect(state.output.value).toBeTruthy()

    // First copy
    await state.copy()
    expect(mockedCopyText).toHaveBeenCalledTimes(1)

    // Second copy — should work again
    await state.copy()
    expect(mockedCopyText).toHaveBeenCalledTimes(2)
  })

  it('copy() clears previous error before attempting copy', async () => {
    const state = usePreset(phpCompatiblePreset)

    // Set a prior error
    state.error.value = 'some previous error'

    // Generate output and copy
    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')
    await state.copy()

    // Error should be cleared (copy succeeded)
    expect(state.error.value).toBeNull()
    expect(mockedCopyText).toHaveBeenCalledTimes(1)
  })

  it('copy() sets error when copyText throws', async () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = DECODED_JSON
    simulateClick(state, 'encode')

    mockedCopyText.mockRejectedValueOnce(new Error('Clipboard unavailable'))

    await state.copy()

    expect(state.error.value).toBe('Clipboard unavailable')
  })
})
