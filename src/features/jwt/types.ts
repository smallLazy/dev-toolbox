/** JWT Plugin — Type Definitions */

export interface JwtConfig {
  pretty: boolean
}

export interface JwtDecodedPart {
  raw: string
  decoded: string
  json: unknown | null
  formatted: string
}

export interface JwtTimeClaim {
  value: number
  iso: string
  local: string
  expired?: boolean
}

export interface JwtPayloadInfo {
  exp?: JwtTimeClaim
  iat?: JwtTimeClaim
  nbf?: JwtTimeClaim
}

export interface JwtResult {
  input: string
  header: JwtDecodedPart
  payload: JwtDecodedPart
  signature: string
  payloadInfo: JwtPayloadInfo
  output: string
}

export interface JwtValidationError {
  field: string
  code: string
  message: string
}

export type JwtValidationResult =
  | { valid: true }
  | { valid: false; errors: JwtValidationError[] }

export interface JwtState {
  input: string
  output: string | null
}
