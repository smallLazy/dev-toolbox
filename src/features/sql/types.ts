/** SQL Plugin — Type Definitions */

export type SqlMode = 'in-builder'
// TODO: add 'format' mode when SQL Formatter is implemented

export type SqlInValueType = 'string' | 'number'
export type SqlInLineMode = 'single' | 'multi'

export interface SqlInConfig {
  valueType: SqlInValueType
  lineMode: SqlInLineMode
  wrapWithParentheses: boolean
  dedupe: boolean
}

export interface SqlConfig {
  mode: SqlMode
  inConfig: SqlInConfig
}

export interface SqlResult {
  input: string
  output: string
  config: SqlConfig
}

export interface SqlValidationError {
  field: string
  code: string
  message: string
}

export type SqlValidationResult =
  | { valid: true }
  | { valid: false; errors: SqlValidationError[] }

export interface SqlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
