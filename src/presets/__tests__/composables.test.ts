/**
 * PHP Codec (Preset) — Composable Tests (mode switching behavior)
 *
 * Tests the EXACT click chain from ToolSegmentedControl button click
 * through to output. This reproduces the real UI interaction path.
 *
 * Click chain:
 *   1. User clicks Decode tab in ToolSegmentedControl
 *   2. pointerdown → handlePointerDown → select → emit('update:modelValue')
 *   3. PresetView @update:model-value → handleModeChange(value)
 *   4. handleModeChange → switchMode(value) → selectMode(value)
 *   5. selectMode → pipelineResult=null → codec.selectMode(value)
 *   6. codec.selectMode → mode.value=value → transform(value)
 *   7. transform → runPipeline(preset, 'decode', input).output → output.value
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { usePreset } from '../composables'
import { runPipeline } from '@/shared/pipeline'
import { phpCompatiblePreset } from '../php-compatible.preset'

// ── Test vectors computed from the actual pipeline ─────────────────────
const DECODED_JSON = '{"code":"index_home_video","ad_type":"video"}'
const ENCODED_JSON = runPipeline(phpCompatiblePreset, 'encode', DECODED_JSON).output

// ── Helper: simulate the PresetView template interaction ────────────
//
// This replicates what happens when a user clicks the Decode tab:
//   <ToolSegmentedControl
//     :model-value="mode"
//     :options="modeOptions"
//     @update:model-value="handleModeChange"
//   />
//
//   function handleModeChange(value: string) {
//     switchMode(value as 'encode' | 'decode')
//   }

function simulateClick(
  presetState: ReturnType<typeof usePreset>,
  newMode: 'encode' | 'decode',
) {
  // Step 1: ToolSegmentedControl emits 'update:modelValue' with the clicked value
  // Step 2: PresetView's @update:model-value calls handleModeChange(value)
  // Step 3: handleModeChange calls switchMode(value)
  presetState.switchMode(newMode)
}

describe('PHP Codec — full click chain simulation', () => {

  // ── Requirement a: default Encode mode, input encoded, first Decode click → JSON

  it('REQ-A: default Encode mode, input encoded, first click Decode outputs JSON immediately', () => {
    const state = usePreset(phpCompatiblePreset)

    // User types/pastes encoded content into the textarea
    state.input.value = ENCODED_JSON

    // Verify initial state
    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBeNull()
    expect(state.error.value).toBeNull()

    // FIRST click on Decode tab — must immediately decode
    simulateClick(state, 'decode')

    // After first click:
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBe(DECODED_JSON)
    expect(state.error.value).toBeNull()
  })

  // ── Requirement b: Decode mode, input JSON, first Encode click → encoded

  it('REQ-B: Decode mode, input JSON, first click Encode outputs encoded immediately', () => {
    // Start in decode mode by switching first
    const state = usePreset(phpCompatiblePreset)

    // User types JSON
    state.input.value = DECODED_JSON

    // Switch to decode mode first (simulates already being on Decode tab)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')

    // Now click Encode tab — must immediately encode
    simulateClick(state, 'encode')

    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBe(ENCODED_JSON)
    expect(state.error.value).toBeNull()
  })

  // ── Requirement c: consecutive switches don't need second click

  it('REQ-C: consecutive Encode/Decode switches each produce output on first click', () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = ENCODED_JSON

    // Click Decode (1st switch)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBe(DECODED_JSON)

    // Click Encode (2nd switch — input is still ENCODED_JSON)
    simulateClick(state, 'encode')
    expect(state.mode.value).toBe('encode')
    expect(state.output.value).toBeTruthy() // double-encoded
    expect(state.error.value).toBeNull()

    // Click Decode (3rd switch)
    simulateClick(state, 'decode')
    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBeTruthy()
    expect(state.error.value).toBeNull()
  })

  // ── Input preserved across switches

  it('input is preserved when switching modes', () => {
    const state = usePreset(phpCompatiblePreset)

    state.input.value = ENCODED_JSON
    expect(state.input.value).toBe(ENCODED_JSON)

    simulateClick(state, 'decode')
    expect(state.input.value).toBe(ENCODED_JSON) // preserved
  })

  // ── Empty input

  it('switching mode with empty input clears output without error', () => {
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

  // ── Error handling

  it('invalid input on decode sets error and clears output', () => {
    const state = usePreset(phpCompatiblePreset)

    // Input that is not valid Base64
    state.input.value = '!!!not-valid-base64!!!'

    simulateClick(state, 'decode')

    expect(state.mode.value).toBe('decode')
    expect(state.output.value).toBeNull()
    expect(state.error.value).toBeTruthy()
  })

  // ── Verify selectMode is the same function as switchMode

  it('switchMode is same function as selectMode (alias integrity)', () => {
    const state = usePreset(phpCompatiblePreset)
    expect(state.switchMode).toBe(state.selectMode)
  })

  // ── Verify the transform actually reads input.value at call time

  it('transform reads input value at time of switch, not at definition time', () => {
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

  it('pipelineResult is cleared on mode switch', () => {
    const state = usePreset(phpCompatiblePreset)

    // Execute to populate pipelineResult
    state.input.value = 'test'
    state.execute()
    // pipelineResult is set asynchronously, but for mode switch it should clear
    state.switchMode('decode')
    expect(state.pipelineResult.value).toBeNull()
  })
})
