/**
 * Plugin Barrel — Centralized re-export of all 33 plugins.
 *
 * Used by the workspace store to collect plugin metadata
 * without importing from Core or SDK internals.
 *
 * Each plugin file exports a PluginInstance from definePlugin().
 * We access .definition to extract id, name, icon, category, route, commands, keywords.
 */

export { default as base64 } from './base64.plugin'
export { default as crypto } from './crypto.plugin'
export { default as diff } from './diff.plugin'
export { default as hash } from './hash.plugin'
export { default as htmlEncode } from './html-encode.plugin'
export { default as jwt } from './jwt.plugin'
export { default as json } from './json.plugin'
export { default as presetPhpCompatible } from './preset-php-compatible.plugin'
export { default as qrcode } from './qrcode.plugin'
export { default as sql } from './sql.plugin'
export { default as timestamp } from './timestamp.plugin'
export { default as unicode } from './unicode.plugin'
export { default as url } from './url.plugin'
export { default as uuid } from './uuid.plugin'
export { default as xml } from './xml.plugin'
