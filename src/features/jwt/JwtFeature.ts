/**
 * JwtFeature — JWT token decoder (no signature verification).
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { JwtConfig, JwtState, JwtResult } from './types'
import { defaults } from './settings'
import { decodeJwt, validateJwtInput, getStats } from './logic'

export class JwtFeature extends BaseFeature<JwtConfig, string, JwtResult> {
  private _toolState: JwtState

  constructor(context: FeatureContext<JwtConfig>) {
    super(context, defaults)
    this._toolState = { input: '', output: null }
  }

  get toolState(): Readonly<JwtState> {
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

  async run(input: string, config: JwtConfig): Promise<JwtResult> {
    return decodeJwt(input, config)
  }

  validate(input: string): ValidationResult {
    const v = validateJwtInput(input)
    if (!v.valid) return { valid: false, errors: v.errors }
    return { valid: true }
  }

  transform(input: string, _config: JwtConfig): string {
    return input.trim()
  }

  preview(): null {
    return null
  }

  cancel(): void {
    this.setIdle()
  }

  saveState(): FeatureState<JwtResult> {
    return { ...this._state }
  }

  loadState(state: FeatureState<JwtResult>): void {
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
