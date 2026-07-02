/**
 * UnicodeFeature — Unicode Encode/Decode Tool
 *
 * Template: transform
 * Extends BaseFeature from Feature SDK.
 * ALL capabilities via this.context. Zero Core/Registry/Service access.
 *
 * Dispatches encode/decode via config.mode and variant via config.variant.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { UnicodeConfig, UnicodeState, UnicodeResult } from './types'
import { defaults } from './settings'
import { encodeUnicode, decodeUnicode, validate, getStats } from './logic'

export class UnicodeFeature extends BaseFeature<UnicodeConfig, string, UnicodeResult> {
  private _toolState: UnicodeState

  constructor(context: FeatureContext<UnicodeConfig>) {
    super(context, defaults)
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  get toolState(): Readonly<UnicodeState> { return this._toolState }

  // ── Lifecycle ─────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaults, ...saved }
    this.lifecycle.transition('initialized')
    this.context.logger.info('UnicodeFeature initialized')
  }

  async activate(): Promise<void> {
    this.lifecycle.transition('active')
    this.context.notification.info('Unicode', 'Encode and decode Unicode escape sequences')
  }

  async deactivate(): Promise<void> { this.saveState(); this.lifecycle.transition('inactive') }
  async dispose(): Promise<void> { this.reset(); this.lifecycle.transition('disposed') }

  // ── Core Logic ────────────────────────────────────────────────────

  /**
   * Sole execution entry point.
   * Dispatches encode() or decode() based on config.mode.
   */
  async run(input: string, config: UnicodeConfig): Promise<UnicodeResult> {
    let output: string

    if (config.mode === 'decode') {
      output = decodeUnicode(input, config.variant)
    } else {
      output = encodeUnicode(input, config.variant)
    }

    const stats = getStats(output)
    this._toolState.outputSize = stats.bytes

    return { output, stats }
  }

  validate(input: string): ValidationResult {
    return validate(input)
  }

  transform(input: string, _config: UnicodeConfig): string {
    const s = getStats(input)
    this._toolState.inputSize = s.bytes
    return input
  }

  preview(_input: string, _config: UnicodeConfig): UnicodeResult | null { return null }
  cancel(): void { this.setIdle() }

  saveState(): FeatureState<UnicodeResult> { return { ...this._state } }
  loadState(state: FeatureState<UnicodeResult>): void { this._state = { ...state } }
  reset(): void {
    this._state = { phase: 'idle', input: '', output: null, error: null, progress: null }
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  // ── History ───────────────────────────────────────────────────────

  recordHistory(): void {
    this.context.history.add({
      input: this._state.input,
      output: this._state.output?.output ?? null,
      config: { ...this._config },
      timestamp: Date.now(),
    })
  }
}
