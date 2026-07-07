/**
 * DiffFeature — Diff comparison tool
 *
 * Extends BaseFeature from Feature SDK.
 * ALL capabilities via this.context. Zero Core/Registry/Service access.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { DiffConfig } from './types'
import { defaults } from './settings'
import { computeDiff, formatUnifiedDiff, getStats } from './logic'

interface DiffToolState {
  leftSize: number
  rightSize: number
  addedCount: number
  removedCount: number
  isIdentical: boolean
}

export class DiffFeature extends BaseFeature<DiffConfig, string, string> {
  private _toolState: DiffToolState

  constructor(context: FeatureContext<DiffConfig>) {
    super(context, defaults)
    this._toolState = {
      leftSize: 0,
      rightSize: 0,
      addedCount: 0,
      removedCount: 0,
      isIdentical: false,
    }
  }

  get toolState(): Readonly<DiffToolState> {
    return this._toolState
  }

  // ── Lifecycle ─────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaults, ...saved }
    this.lifecycle.transition('initialized')
    this.context.logger.info('DiffFeature initialized')
  }

  async activate(): Promise<void> {
    this.lifecycle.transition('active')
  }

  async deactivate(): Promise<void> {
    this.saveState()
    this.lifecycle.transition('inactive')
  }

  async dispose(): Promise<void> {
    this.reset()
    this.lifecycle.transition('disposed')
  }

  // ── Core Logic ────────────────────────────────────────────────────

  async run(leftText: string, config: DiffConfig): Promise<string> {
    const diff = computeDiff(leftText, config.rightText, {
      contextLines: config.contextLines,
      ignoreWhitespace: config.ignoreWhitespace,
      ignoreCase: config.ignoreCase,
    })

    this._toolState = {
      leftSize: new TextEncoder().encode(leftText).length,
      rightSize: new TextEncoder().encode(config.rightText).length,
      addedCount: diff.addedCount,
      removedCount: diff.removedCount,
      isIdentical: diff.isIdentical,
    }

    return formatUnifiedDiff(diff)
  }

  validate(input: string): ValidationResult {
    const MAX_SIZE = 500 * 1024
    if (new TextEncoder().encode(input).length > MAX_SIZE) {
      return {
        valid: false,
        errors: [
          { field: 'input', message: `Input exceeds maximum size of 500 KB` },
        ],
      }
    }
    return { valid: true }
  }

  transform(input: string, _config: DiffConfig): string {
    return input
  }

  preview(_input: string, _config: DiffConfig): string | null {
    return null
  }

  cancel(): void {
    this.setIdle()
  }

  saveState(): FeatureState<string> {
    return { ...this._state }
  }

  loadState(state: FeatureState<string>): void {
    this._state = { ...state }
  }

  reset(): void {
    this._state = {
      phase: 'idle',
      input: '',
      output: null,
      error: null,
      progress: null,
    }
    this._toolState = {
      leftSize: 0,
      rightSize: 0,
      addedCount: 0,
      removedCount: 0,
      isIdentical: false,
    }
  }

  // ── History ───────────────────────────────────────────────────────

  recordHistory(): void {
    this.context.history.add({
      leftText: this._state.input,
      rightText: (this._config as DiffConfig).rightText ?? '',
      output: this._state.output,
      timestamp: Date.now(),
    })
  }
}
