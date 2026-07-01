/**
 * Pipeline Runner — Internal shared utility.
 *
 * Executes a PipelinePreset's encode or decode steps in order.
 * Pure function — no side effects, no Vue/DOM/FS/Network access.
 *
 * NOT a public SDK API. Only serves built-in Presets.
 */

import type { PipelineStep, PipelinePreset, PipelineResult, PipelineError } from './types'

/**
 * Execute a pipeline in encode or decode direction.
 *
 * @param preset - The Preset definition
 * @param mode   - 'encode' or 'decode'
 * @param input  - Raw input string
 * @returns PipelineResult on success
 * @throws  PipelineError if any step fails
 *
 * Behavior:
 *   1. Selects steps based on mode (encodeSteps / decodeSteps)
 *   2. For each step in order, calls step.execute(currentInput)
 *   3. Records intermediate output and duration for each step
 *   4. On step failure, wraps the error in PipelineError and throws
 *   5. Empty input returns an empty PipelineResult immediately
 */
export function runPipeline(
  preset: PipelinePreset,
  mode: 'encode' | 'decode',
  input: string,
): PipelineResult {
  const steps: PipelineStep[] =
    mode === 'encode' ? preset.encodeSteps : preset.decodeSteps

  if (steps.length === 0) {
    const err = new Error(`Preset "${preset.id}" has no ${mode} steps defined`) as PipelineError
    err.stepId = 'pipeline'
    err.stepLabel = 'Pipeline'
    err.cause = new Error('No steps defined')
    throw err
  }

  if (input === '') {
    return { output: '', steps: [], totalDurationMs: 0 }
  }

  const t0 = performance.now()
  const stepResults: PipelineResult['steps'] = []
  let currentInput = input

  for (const step of steps) {
    // Optional pre-validation
    if (step.validate && !step.validate(currentInput)) {
      const err = new Error(
        `Step "${step.label}" validation failed: input is not valid for this step`,
      ) as PipelineError
      err.stepId = step.id
      err.stepLabel = step.label
      err.cause = new Error('Validation failed')
      throw err
    }

    const stepT0 = performance.now()
    try {
      currentInput = step.execute(currentInput)
    } catch (e) {
      const err = new Error(
        `Step "${step.label}" failed: ${(e as Error).message}`,
      ) as PipelineError
      err.stepId = step.id
      err.stepLabel = step.label
      err.cause = e as Error
      throw err
    }
    const stepT1 = performance.now()

    stepResults.push({
      stepId: step.id,
      label: step.label,
      output: currentInput,
      durationMs: Math.round((stepT1 - stepT0) * 100) / 100,
    })
  }

  const t1 = performance.now()

  return {
    output: currentInput,
    steps: stepResults,
    totalDurationMs: Math.round((t1 - t0) * 100) / 100,
  }
}
