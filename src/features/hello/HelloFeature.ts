/**
 * HelloFeature — SDK-powered Hello Plugin
 *
 * Demonstrates the standard Feature SDK pattern:
 *   - Extends BaseFeature<TConfig, TInput, TOutput>
 *   - Implements all 12 abstract methods
 *   - Uses this.context for ALL external capabilities
 *   - Zero direct Core/Registry/Service access
 */

import {
  BaseFeature,
  createFeatureContext,
  type FeatureContext,
  type FeatureConfig,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import { getGreeting, generateSessionId } from './logic'

// ── Config ──────────────────────────────────────────────────────────────

export interface HelloConfig extends FeatureConfig {
  greetingName: string
  autoActivate: boolean
}

const defaultConfig: HelloConfig = {
  greetingName: 'Developer',
  autoActivate: true,
}

// ── Feature ─────────────────────────────────────────────────────────────

export class HelloFeature extends BaseFeature<HelloConfig, string, string> {
  private sessionId: string

  constructor(contextOverride?: Partial<FeatureContext<HelloConfig>>) {
    // Create context via SDK factory — NO Core import!
    const context = createFeatureContext<HelloConfig>(
      {
        id: 'hello',
        name: 'Hello Plugin',
        description: 'Framework Validation',
        icon: 'Beaker',
        version: '1.0.0',
        category: 'utility',
      },
      contextOverride
    )

    super(context, defaultConfig)
    this.sessionId = generateSessionId()
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    this.context.logger.info('Initializing HelloFeature')
    await this.context.settings.load()
    this.lifecycle.transition('initialized')
  }

  async activate(): Promise<void> {
    this.context.logger.info('Activating HelloFeature')
    this.lifecycle.transition('active')
    this.context.notification.info('Hello Plugin', `Session: ${this.sessionId}`)
  }

  async deactivate(): Promise<void> {
    this.saveState()
    this.lifecycle.transition('inactive')
    this.context.logger.info('Deactivated HelloFeature')
  }

  async dispose(): Promise<void> {
    this.reset()
    this.lifecycle.transition('disposed')
    this.context.logger.info('Disposed HelloFeature')
  }

  // ── Core Logic ───────────────────────────────────────────────────────

  async run(input: string, config: HelloConfig): Promise<string> {
    // Pure transformation — no side effects
    const greeting = getGreeting(input || config.greetingName)

    // Record history via context (NOT via direct HistoryRegistry access)
    await this.context.history.add({
      input,
      output: greeting,
      config: { ...config },
      sessionId: this.sessionId,
      timestamp: Date.now(),
    })

    return greeting
  }

  validate(input: string): ValidationResult {
    if (!input || !input.trim()) {
      return {
        valid: false,
        errors: [{ field: 'input', message: 'Please enter a name or message' }],
      }
    }
    return { valid: true }
  }

  transform(input: string, _config: HelloConfig): string {
    return input.trim()
  }

  preview(input: string, _config: HelloConfig): string | null {
    if (input.length > 0) {
      return `Preview: ${getGreeting(input)}`
    }
    return null
  }

  cancel(): void {
    this.setIdle()
  }

  // ── State ────────────────────────────────────────────────────────────

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
    this.sessionId = generateSessionId()
  }

  // ── Public Helpers ───────────────────────────────────────────────────

  getSessionId(): string {
    return this.sessionId
  }

  getHistoryCount(): number {
    return this.context.history.count
  }

  async getFavoriteStatus(): Promise<boolean> {
    // In a real Feature, this would check FavoriteRegistry via context
    return false
  }
}
