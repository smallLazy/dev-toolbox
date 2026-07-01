/**
 * JsonFeature — Platform Validation Feature
 *
 * Proves the entire Platform works:
 *   - Extends BaseFeature (Feature SDK)
 *   - Uses this.context for ALL capabilities
 *   - Zero direct Core/Registry/Service access
 *   - All logic in pure functions (logic.ts)
 *
 * This is the reference implementation for ALL future Features.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { JsonConfig, JsonState } from './types'
import { jsonDefaults } from './settings'
import {
  formatJson, minifyJson, validateJson,
  getStats, formatSize,
} from './logic'

export class JsonFeature extends BaseFeature<JsonConfig, string, string> {
  private _jsonState: JsonState

  constructor(context: FeatureContext<JsonConfig>) {
    super(context, jsonDefaults)
    this._jsonState = {
      input: '',
      output: null,
      inputLines: 0,
      outputLines: 0,
      inputSize: 0,
      outputSize: null,
    }
  }

  // ── State Accessors ─────────────────────────────────────────────────

  get jsonState(): Readonly<JsonState> { return this._jsonState }

  get inputStats(): string {
    return `${this._jsonState.inputLines} lines · ${formatSize(this._jsonState.inputSize)}`
  }

  get outputStats(): string | null {
    if (!this._jsonState.output) return null
    return `${this._jsonState.outputLines} lines · ${formatSize(this._jsonState.outputSize ?? 0)}`
  }

  // ── Lifecycle ───────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...jsonDefaults, ...saved }
    this.lifecycle.transition('initialized')
    this.context.logger.info('JsonFeature initialized')
  }

  async activate(): Promise<void> {
    this.lifecycle.transition('active')
    this.context.notification.info('JSON Plugin', 'Ready to format, minify, or validate')
  }

  async deactivate(): Promise<void> {
    this.saveState()
    this.lifecycle.transition('inactive')
  }

  async dispose(): Promise<void> {
    this.reset()
    this.lifecycle.transition('disposed')
  }

  // ── Core Logic (delegates to pure functions) ────────────────────────

  /**
   * Run the JSON operation.
   * Mode is passed via config. Auto-detects format vs minify vs validate.
   */
  async run(input: string, config: JsonConfig): Promise<string> {
    const mode = (config as JsonConfig & { mode?: string }).mode ?? 'format'

    switch (mode) {
      case 'minify': {
        const result = minifyJson(input)
        this._jsonState.outputLines = result.lines
        this._jsonState.outputSize = result.size
        return result.formatted
      }
      case 'validate': {
        const vr = validateJson(input)
        if (!vr.valid) {
          throw new Error(vr.errors[0]?.message ?? 'Invalid JSON')
        }
        return JSON.stringify(JSON.parse(input), null, 2)
      }
      case 'format':
      default: {
        const result = formatJson(input, config)
        this._jsonState.outputLines = result.lines
        this._jsonState.outputSize = result.size
        return result.formatted
      }
    }
  }

  validate(input: string): ValidationResult {
    if (!input.trim()) {
      return { valid: false, errors: [{ field: 'input', message: 'Please enter JSON text' }] }
    }
    const vr = validateJson(input)
    if (!vr.valid) {
      return {
        valid: false,
        errors: vr.errors.map((e) => ({
          field: 'input',
          message: `Column ${e.column}: ${e.message}`,
        })),
      }
    }
    return { valid: true }
  }

  transform(input: string, _config: JsonConfig): string {
    const trimmed = input.trim()
    const stats = getStats(trimmed)
    this._jsonState.inputLines = stats.lines
    this._jsonState.inputSize = stats.size
    return trimmed
  }

  preview(_input: string, _config: JsonConfig): string | null {
    return null // JSON preview not meaningful for short input
  }

  cancel(): void {
    this.setIdle()
  }

  // ── State Persistence ──────────────────────────────────────────────

  saveState(): FeatureState<string> {
    return { ...this._state }
  }

  loadState(state: FeatureState<string>): void {
    this._state = { ...state }
  }

  reset(): void {
    this._state = { phase: 'idle', input: '', output: null, error: null, progress: null }
    this._jsonState = { input: '', output: null, inputLines: 0, outputLines: 0, inputSize: 0, outputSize: null }
  }

  // ── Clipboard (via context) ────────────────────────────────────────

  async copyInput(): Promise<void> {
    if (this._state.input) {
      await this.context.clipboard.copy(this._state.input)
    }
  }

  async pasteInput(): Promise<void> {
    const text = await this.context.clipboard.paste()
    if (text) {
      this._state.input = text
    }
  }

  // ── History ────────────────────────────────────────────────────────

  recordHistory(mode: string): void {
    this.context.history.add({
      input: this._state.input,
      output: this._state.output,
      mode,
      timestamp: Date.now(),
      inputSize: this._jsonState.inputSize,
      outputSize: this._jsonState.outputSize,
    })
  }
}
