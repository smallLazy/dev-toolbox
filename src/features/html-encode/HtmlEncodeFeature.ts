/**
 * HtmlEncodeFeature — HTML Entity Encode/Decode Feature
 *
 * Extends BaseFeature from Feature SDK.
 * ALL capabilities via this.context. Zero Core/Registry/Service access.
 *
 * Dispatches encodeHtml() / decodeHtml() based on config.mode.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { HtmlEncodeConfig, HtmlEncodeState } from './types'
import { defaults } from './settings'
import { encodeHtml, decodeHtml, getStats } from './logic'

export class HtmlEncodeFeature extends BaseFeature<HtmlEncodeConfig, string, string> {
  private _toolState: HtmlEncodeState

  constructor(context: FeatureContext<HtmlEncodeConfig>) {
    super(context, defaults)
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  get toolState(): Readonly<HtmlEncodeState> { return this._toolState }

  // ── Lifecycle ─────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaults, ...saved }
    this.lifecycle.transition('initialized')
    this.context.logger.info('HtmlEncodeFeature initialized')
  }

  async activate(): Promise<void> {
    this.lifecycle.transition('active')
    this.context.notification.info('HTML Encode', 'Encode and decode HTML entities')
  }

  async deactivate(): Promise<void> { this.saveState(); this.lifecycle.transition('inactive') }
  async dispose(): Promise<void> { this.reset(); this.lifecycle.transition('disposed') }

  // ── Core Logic ────────────────────────────────────────────────────

  /**
   * Sole execution entry point.
   * Dispatches encodeHtml() or decodeHtml() based on config.mode.
   */
  async run(input: string, config: HtmlEncodeConfig): Promise<string> {
    const output = config.mode === 'decode'
      ? decodeHtml(input)
      : encodeHtml(input)

    const stats = getStats(output)
    this._toolState.outputSize = stats.bytes

    return output
  }

  validate(input: string): ValidationResult {
    if (!input.trim()) {
      return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
    }
    return { valid: true }
  }

  transform(input: string, _config: HtmlEncodeConfig): string {
    const s = getStats(input)
    this._toolState.inputSize = s.bytes
    return input.trim()
  }

  preview(_input: string, _config: HtmlEncodeConfig): string | null { return null }
  cancel(): void { this.setIdle() }

  saveState(): FeatureState<string> { return { ...this._state } }
  loadState(state: FeatureState<string>): void { this._state = { ...state } }
  reset(): void {
    this._state = { phase: 'idle', input: '', output: null, error: null, progress: null }
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  // ── History ───────────────────────────────────────────────────────

  recordHistory(): void {
    this.context.history.add({
      input: this._state.input,
      output: this._state.output,
      timestamp: Date.now(),
    })
  }
}
