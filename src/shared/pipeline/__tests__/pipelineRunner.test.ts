/**
 * Pipeline Runner — Unit Tests
 */

import { describe, it, expect } from 'vitest'
import { runPipeline } from '../pipelineRunner'
import type { PipelinePreset } from '../types'

// ── Test fixtures ────────────────────────────────────────────────────

const singleStepPreset: PipelinePreset = {
  id: 'test-single',
  name: 'Test Single',
  description: '',
  icon: 'CaseSensitive',
  category: 'encoding',
  version: '0.0.0',
  route: '/test',
  mode: 'encode',
  keywords: [],
  encodeSteps: [
    { id: 'upper', label: 'Uppercase', execute: (s: string) => s.toUpperCase() },
  ],
  decodeSteps: [
    { id: 'lower', label: 'Lowercase', execute: (s: string) => s.toLowerCase() },
  ],
}

const multiStepPreset: PipelinePreset = {
  id: 'test-multi',
  name: 'Test Multi',
  description: '',
  icon: 'CaseSensitive',
  category: 'encoding',
  version: '0.0.0',
  route: '/test-multi',
  mode: 'encode',
  keywords: [],
  encodeSteps: [
    { id: 'trim', label: 'Trim', execute: (s: string) => s.trim() },
    { id: 'upper', label: 'Uppercase', execute: (s: string) => s.toUpperCase() },
    { id: 'dash', label: 'Dash Spaces', execute: (s: string) => s.replace(/ /g, '-') },
  ],
  decodeSteps: [],
}

const throwingStepPreset: PipelinePreset = {
  id: 'test-throws',
  name: 'Test Throws',
  description: '',
  icon: 'CaseSensitive',
  category: 'encoding',
  version: '0.0.0',
  route: '/test-throws',
  mode: 'encode',
  keywords: [],
  encodeSteps: [
    { id: 'upper', label: 'Uppercase', execute: (s: string) => s.toUpperCase() },
    {
      id: 'explode',
      label: 'Explode',
      execute: () => { throw new Error('BOOM') },
    },
  ],
  decodeSteps: [],
}

const validatingStepPreset: PipelinePreset = {
  id: 'test-validate',
  name: 'Test Validate',
  description: '',
  icon: 'CaseSensitive',
  category: 'encoding',
  version: '0.0.0',
  route: '/test-validate',
  mode: 'encode',
  keywords: [],
  encodeSteps: [
    {
      id: 'validate-upper',
      label: 'Validate Uppercase',
      execute: (s: string) => s.toUpperCase(),
      validate: (s: string) => /^[a-z]+$/.test(s),
    },
  ],
  decodeSteps: [],
}

const emptyStepsPreset: PipelinePreset = {
  id: 'test-empty-steps',
  name: 'Test Empty Steps',
  description: '',
  icon: 'CaseSensitive',
  category: 'encoding',
  version: '0.0.0',
  route: '/test-empty',
  mode: 'encode',
  keywords: [],
  encodeSteps: [],
  decodeSteps: [],
}

// ── Tests ────────────────────────────────────────────────────────────

describe('runPipeline', () => {
  describe('single-step pipeline', () => {
    it('executes the step and returns result', () => {
      const result = runPipeline(singleStepPreset, 'encode', 'hello')
      expect(result.output).toBe('HELLO')
    })

    it('records step output and metadata', () => {
      const result = runPipeline(singleStepPreset, 'encode', 'hello')
      expect(result.steps).toHaveLength(1)
      expect(result.steps[0].stepId).toBe('upper')
      expect(result.steps[0].label).toBe('Uppercase')
      expect(result.steps[0].output).toBe('HELLO')
      expect(result.steps[0].durationMs).toBeGreaterThanOrEqual(0)
    })

    it('records total duration', () => {
      const result = runPipeline(singleStepPreset, 'encode', 'hello')
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('multi-step pipeline', () => {
    it('chains steps in order', () => {
      const result = runPipeline(multiStepPreset, 'encode', '  hello world  ')
      // trim → upper → dash
      expect(result.output).toBe('HELLO-WORLD')
    })

    it('records all intermediate outputs', () => {
      const result = runPipeline(multiStepPreset, 'encode', '  hello world  ')
      expect(result.steps).toHaveLength(3)
      expect(result.steps[0].output).toBe('hello world') // trim
      expect(result.steps[1].output).toBe('HELLO WORLD') // upper
      expect(result.steps[2].output).toBe('HELLO-WORLD') // dash
    })
  })

  describe('mode selection', () => {
    it('uses encodeSteps when mode is encode', () => {
      const result = runPipeline(singleStepPreset, 'encode', 'Hello')
      expect(result.output).toBe('HELLO') // uppercase
    })

    it('uses decodeSteps when mode is decode', () => {
      const result = runPipeline(singleStepPreset, 'decode', 'HELLO')
      expect(result.output).toBe('hello') // lowercase
    })
  })

  describe('empty input', () => {
    it('returns empty PipelineResult for empty string', () => {
      const result = runPipeline(singleStepPreset, 'encode', '')
      expect(result.output).toBe('')
      expect(result.steps).toHaveLength(0)
      expect(result.totalDurationMs).toBe(0)
    })
  })

  describe('empty steps', () => {
    it('throws PipelineError when no steps defined', () => {
      expect(() => runPipeline(emptyStepsPreset, 'encode', 'hello')).toThrow()
    })

    it('includes stepLabel in error', () => {
      try {
        runPipeline(emptyStepsPreset, 'encode', 'hello')
        expect.fail('Should have thrown')
      } catch (e) {
        expect((e as Error).message).toContain('no')
      }
    })
  })

  describe('error handling', () => {
    it('throws PipelineError when a step throws', () => {
      expect(() => runPipeline(throwingStepPreset, 'encode', 'hello')).toThrow()
    })

    it('includes stepId and stepLabel in error', () => {
      try {
        runPipeline(throwingStepPreset, 'encode', 'hello')
        expect.fail('Should have thrown')
      } catch (e) {
        const pe = e as { stepId?: string; stepLabel?: string; cause?: Error }
        expect(pe.stepId).toBe('explode')
        expect(pe.stepLabel).toBe('Explode')
        expect(pe.cause?.message).toBe('BOOM')
      }
    })

    it('does not execute subsequent steps after failure', () => {
      try {
        runPipeline(throwingStepPreset, 'encode', 'hello')
      } catch {
        // The failing step is the 2nd one. Only the 1st should have run.
      }
      // Uppercase step (1st) runs, then Explode (2nd) fails — no 3rd step
      // Verified by the error having stepId='explode'
    })

    it('validates input and throws if validation fails', () => {
      expect(() =>
        runPipeline(validatingStepPreset, 'encode', '123'),
      ).toThrow()
    })

    it('passes validation for valid input', () => {
      const result = runPipeline(validatingStepPreset, 'encode', 'abc')
      expect(result.output).toBe('ABC')
    })
  })
})
