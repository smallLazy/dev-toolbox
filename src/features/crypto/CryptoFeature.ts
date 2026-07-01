/**
 * CryptoFeature — AES-256 symmetric encryption via Tauri aes_crypt command.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { CryptoConfig, CryptoState } from './types'
import { defaultConfig } from './settings'
import { validateCryptoInput, getStats } from './logic'

export class CryptoFeature extends BaseFeature<CryptoConfig, string, string> {
  private _toolState: CryptoState

  constructor(context: FeatureContext<CryptoConfig>) {
    super(context, defaultConfig)
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  get toolState(): Readonly<CryptoState> {
    return this._toolState
  }

  // ── Lifecycle ─────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaultConfig, ...saved }
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

  // ── Core Logic ────────────────────────────────────────────────────

  /**
   * run() is provided for SDK compatibility.
   * The actual Tauri invoke happens in the composable so it can be
   * caught and displayed reactively.
   */
  async run(_input: string, _config: CryptoConfig): Promise<string> {
    // Invoke path lives in composable for async/reactive error handling.
    return ''
  }

  validate(input: string): ValidationResult {
    // Composable passes key/iv/algorithm directly — Feature validate
    // is a fallback that checks input non-emptiness only.
    if (!input.trim()) {
      return {
        valid: false,
        errors: [{ field: 'input', code: 'EMPTY_INPUT', message: 'Input is required' }],
      }
    }
    return { valid: true }
  }

  transform(input: string, _config: CryptoConfig): string {
    const s = getStats(input)
    this._toolState.inputSize = s.bytes
    return input.trim()
  }

  preview(): null {
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
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  recordHistory(): void {
    this.context.history.add({
      input: this._state.input,
      output: this._state.output,
      timestamp: Date.now(),
    } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
