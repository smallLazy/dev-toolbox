/**
 * BaseFeature — Abstract base class for ALL Features.
 *
 * Every tool (AES, JSON, JWT, Base64, Regex, SQL...) MUST extend this class.
 * Provides standardized lifecycle, state management, and context access.
 *
 * Features MUST implement:
 *   - initialize()    — one-time setup
 *   - activate()      — called when user opens the tool
 *   - deactivate()    — called when user leaves the tool
 *   - dispose()       — final cleanup
 *   - run()           — core logic (pure function)
 *   - validate()      — input validation
 *   - transform()     — input preprocessing
 *   - preview()       — optional preview
 *   - cancel()        — abort ongoing work
 *   - saveState()     — persist state
 *   - loadState()     — restore state
 *   - reset()         — reset to defaults
 */

import type { FeatureConfig, FeatureState, ValidationResult } from './types'
import type { FeatureContext } from './FeatureContext'
import { createFeatureLifecycle, type FeatureLifecycle } from './FeatureLifecycle'
import type { FeatureResult } from './FeatureResult'

export abstract class BaseFeature<
  TConfig extends FeatureConfig = FeatureConfig,
  TInput = string,
  TOutput = string,
> {
  // ── Protected Fields ────────────────────────────────────────────────

  protected readonly lifecycle: FeatureLifecycle
  protected _state: FeatureState<TOutput>
  protected _config: TConfig

  // ── Constructor ─────────────────────────────────────────────────────

  constructor(
    protected readonly context: FeatureContext<TConfig>,
    defaultConfig: TConfig
  ) {
    this.lifecycle = createFeatureLifecycle()
    this._config = { ...defaultConfig }
    this._state = {
      phase: 'idle',
      input: '',
      output: null,
      error: null,
      progress: null,
    }
  }

  // ── Public Accessors ────────────────────────────────────────────────

  get state(): Readonly<FeatureState<TOutput>> {
    return this._state
  }

  get config(): TConfig {
    return this._config
  }

  get isActive(): boolean {
    return this.lifecycle.isActive
  }

  // ── Lifecycle (Abstract) ────────────────────────────────────────────

  /** One-time setup. Called once when the Feature is first loaded. */
  abstract initialize(): Promise<void>

  /** Called when the user opens/activates this tool. */
  abstract activate(): Promise<void>

  /** Called when the user leaves/deactivates this tool. */
  abstract deactivate(): Promise<void>

  /** Final cleanup. Called when the plugin is unloaded. */
  abstract dispose(): Promise<void>

  // ── Core Logic (Abstract) ──────────────────────────────────────────

  /**
   * Execute the core transformation logic.
   * MUST be a pure function — no side effects on `this.state` or `this.config`.
   * State mutations happen in the calling code (composable), not here.
   */
  abstract run(input: TInput, config: TConfig): Promise<TOutput>

  /** Validate input before execution. Returns structured result. */
  abstract validate(input: TInput): ValidationResult

  /** Preprocess/transform input before passing to run(). */
  abstract transform(input: TInput, config: TConfig): TInput

  /** Optional: generate a preview without full execution. */
  abstract preview(input: TInput, config: TConfig): TOutput | null

  /** Abort any ongoing async work. */
  abstract cancel(): void

  // ── State Persistence (Abstract) ────────────────────────────────────

  /** Save current state for later restoration. */
  abstract saveState(): FeatureState<TOutput>

  /** Restore state from a previously saved state. */
  abstract loadState(state: FeatureState<TOutput>): void

  /** Reset all state to defaults. */
  abstract reset(): void

  // ── Convenience Methods ─────────────────────────────────────────────

  /** Set the feature state to loading. */
  protected setLoading(progress?: number): void {
    this._state = { ...this._state, phase: 'loading', error: null, progress: progress ?? null }
  }

  /** Set the feature state to success with output. */
  protected setSuccess(output: TOutput): void {
    this._state = { ...this._state, phase: 'success', output, error: null, progress: null }
  }

  /** Set the feature state to error with message. */
  protected setError(message: string): void {
    this._state = { ...this._state, phase: 'error', error: message, progress: null }
  }

  /** Set the feature state to idle. */
  protected setIdle(): void {
    this._state = { ...this._state, phase: 'idle', error: null, progress: null }
  }

  /** Set the feature state to empty. */
  protected setEmpty(): void {
    this._state = { ...this._state, phase: 'empty', output: null, error: null, progress: null }
  }

  /** Execute the full pipeline: validate → transform → run → update state. */
  async execute(input: TInput): Promise<FeatureResult<TOutput>> {
    // 1. Validate
    const validation = this.validate(input)
    if (!validation.valid) {
      const msg = validation.errors[0]?.message ?? 'Validation failed'
      this.setError(msg)
      return { kind: 'error', message: msg }
    }

    // 2. Transform
    const transformed = this.transform(input, this._config)

    // 3. Run
    this.setLoading()
    try {
      const output = await this.run(transformed, this._config)
      if (output === null || output === undefined) {
        this.setEmpty()
        return { kind: 'empty', message: 'No output produced' }
      }
      this.setSuccess(output)
      return { kind: 'success', data: output }
    } catch (err) {
      const msg = (err as Error).message
      this.setError(msg)
      return { kind: 'error', message: msg }
    }
  }
}
