/**
 * TimestampFeature — Timestamp ↔ Date converter.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { TimestampConfig, TimestampState, TimestampResult } from './types'
import { defaults } from './settings'
import { transformTimestamp, validateInput } from './logic'

export class TimestampFeature extends BaseFeature<TimestampConfig, string, TimestampResult> {
  private _toolState: TimestampState

  constructor(context: FeatureContext<TimestampConfig>) {
    super(context, defaults)
    this._toolState = { input: '', output: null }
  }

  get toolState(): Readonly<TimestampState> {
    return this._toolState
  }

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaults, ...saved }
    this.lifecycle.transition('initialized')
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

  async run(input: string, config: TimestampConfig): Promise<TimestampResult> {
    return transformTimestamp(input, config)
  }

  validate(input: string): ValidationResult {
    const v = validateInput(input, this._config)
    if (!v.valid) {
      return { valid: false, errors: v.errors }
    }
    return { valid: true }
  }

  transform(input: string, _config: TimestampConfig): string {
    return input
  }

  preview(): null {
    return null
  }

  cancel(): void {
    this.setIdle()
  }

  saveState(): FeatureState<TimestampResult> {
    return { ...this._state }
  }

  loadState(state: FeatureState<TimestampResult>): void {
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
    this._toolState = { input: '', output: null }
  }
}
