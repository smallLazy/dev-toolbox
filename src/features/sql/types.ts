/** SQL Plugin — Type Definitions */

export type SqlInValueType = 'string' | 'number'
export type SqlInLineMode = 'single' | 'multi'

export interface SqlInConfig {
  valueType: SqlInValueType
  lineMode: SqlInLineMode
  wrapWithParentheses: boolean
  dedupe: boolean
}

export interface SqlConfig {
  mode: 'in-builder'
  inConfig: SqlInConfig
}

export interface SqlResult {
  input: string
  output: string | null
  config: SqlConfig
  error?: string
  itemCount?: number
}

export interface SqlValidationError {
  field: string
  code: string
  message: string
}

export type SqlValidationResult =
  | { valid: true }
  | { valid: false; errors: SqlValidationError[] }

export interface SqlBuildSuccess {
  success: true
  output: string
  itemCount: number
}

export interface SqlBuildEmpty {
  success: false
  empty: true
}

export interface SqlBuildError {
  success: false
  error: string
  empty?: false
}

export type SqlBuildOutcome = SqlBuildSuccess | SqlBuildEmpty | SqlBuildError

export interface SqlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
