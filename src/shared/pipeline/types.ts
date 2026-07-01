/**
 * Pipeline Types — Internal shared utility types.
 *
 * NOT a public SDK API. Only serves built-in Presets.
 * Future: if Pipeline becomes a platform capability, migrate to src/sdk/pipeline/
 * via standalone RFC/ADR.
 */

/** A single step in a pipeline — calls a pure function from a Feature's logic.ts */
export interface PipelineStep {
  /** Step identifier (for logging / error reporting) */
  readonly id: string
  /** Human-readable label */
  readonly label: string
  /**
   * Execute the step.
   * Takes the previous step's output string, returns the transformed string.
   * Must be a pure function — no side effects, no DOM/FS/Network access.
   * Errors are thrown directly and caught by pipelineRunner.
   */
  readonly execute: (input: string) => string
  /** Optional: validate input before executing this step. Returns false to abort. */
  readonly validate?: (input: string) => boolean
}

/** A named pipeline — an ordered sequence of Steps */
export interface PipelinePreset {
  /** Unique identifier, e.g. 'php-compatible' */
  readonly id: string
  /** Display name, e.g. 'PHP Compatible' */
  readonly name: string
  /** Description shown in UI subtitle */
  readonly description: string
  /** Icon key from @/design/icons */
  readonly icon: string
  /** Category matching existing Sidebar categories */
  readonly category: string
  /** Version */
  readonly version: string
  /** Route path, e.g. '/preset/php-compatible' */
  readonly route: string
  /** Default mode */
  readonly mode: 'encode' | 'decode'
  /** Encode steps (executed in order) */
  readonly encodeSteps: PipelineStep[]
  /** Decode steps (executed in order, reverse direction) */
  readonly decodeSteps: PipelineStep[]
  /** Search keywords (CN + EN) */
  readonly keywords: string[]
  /** Migration metadata — set when this Preset replaces a legacy feature */
  readonly deprecated?: {
    readonly oldRoute: string
    readonly oldName: string
    readonly migrationNote: string
  }
}

/** Successful pipeline execution result */
export interface PipelineResult {
  /** Final output string */
  output: string
  /** Per-step intermediate results (for debugging / display) */
  steps: Array<{
    stepId: string
    label: string
    output: string
    durationMs: number
  }>
  /** Total execution time in milliseconds */
  totalDurationMs: number
}

/** Pipeline execution error — identifies which step failed */
export interface PipelineError extends Error {
  message: string
  stepId: string
  stepLabel: string
  cause: Error
}
