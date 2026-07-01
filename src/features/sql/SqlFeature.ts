/**
 * SqlFeature — SQL IN Builder + future Formatter.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { SqlConfig, SqlState, SqlResult } from './types'
import { defaults } from './settings'
import { transformSql, validateSqlInput, getStats } from './logic'

export class SqlFeature extends BaseFeature<SqlConfig, string, SqlResult> {
  private _toolState: SqlState

  constructor(context: FeatureContext<SqlConfig>) {
    super(context, defaults)
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  get toolState(): Readonly<SqlState> {
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

  async run(input: string, config: SqlConfig): Promise<SqlResult> {
    const result = transformSql(input, config)
    const stats = getStats(result.output)
    this._toolState.outputSize = stats.size
    return result
  }

  validate(input: string): ValidationResult {
    const v = validateSqlInput(input, this._config)
    if (!v.valid) {
      return { valid: false, errors: v.errors }
    }
    return { valid: true }
  }

  transform(input: string, _config: SqlConfig): string {
    return input
  }

  preview(): null {
    return null
  }

  cancel(): void {
    this.setIdle()
  }

  saveState(): FeatureState<SqlResult> {
    return { ...this._state }
  }

  loadState(state: FeatureState<SqlResult>): void {
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
      output: this._state.output?.output ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timestamp: Date.now(),
    } as any)
  }
}
