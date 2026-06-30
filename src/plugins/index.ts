/**
 * Plugin Barrel — Centralized re-export of all 33 plugins.
 *
 * Used by the workspace store to collect plugin metadata
 * without importing from Core or SDK internals.
 *
 * Each plugin file exports a PluginInstance from definePlugin().
 * We access .definition to extract id, name, icon, category, route, commands, keywords.
 */

export { default as agent } from './agent.plugin'
export { default as color } from './color.plugin'
export { default as curl } from './curl.plugin'
export { default as diff } from './diff.plugin'
export { default as explain } from './explain.plugin'
export { default as gitee } from './gitee.plugin'
export { default as github } from './github.plugin'
export { default as graphql } from './graphql.plugin'
export { default as hello } from './hello.plugin'
export { default as htmlEncode } from './html-encode.plugin'
export { default as httpClient } from './http-client.plugin'
export { default as jira } from './jira.plugin'
export { default as json } from './json.plugin'
export { default as markdown } from './markdown.plugin'
export { default as prompt } from './prompt.plugin'
export { default as qrcode } from './qrcode.plugin'
export { default as regex } from './regex.plugin'
export { default as requestDecoder } from './request-decoder.plugin'
export { default as review } from './review.plugin'
export { default as rsa } from './rsa.plugin'
export { default as sentry } from './sentry.plugin'
export { default as sm2 } from './sm2.plugin'
export { default as sm3 } from './sm3.plugin'
export { default as sm4 } from './sm4.plugin'
export { default as sql } from './sql.plugin'
export { default as translate } from './translate.plugin'
export { default as unicode } from './unicode.plugin'
export { default as uuid } from './uuid.plugin'
export { default as websocket } from './websocket.plugin'
export { default as wecom } from './wecom.plugin'
export { default as xml } from './xml.plugin'
export { default as yaml } from './yaml.plugin'
export { default as zentao } from './zentao.plugin'
