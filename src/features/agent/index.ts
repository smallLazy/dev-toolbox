/** Agent Plugin — Public API */

export { default as AgentView } from './AgentView.vue'
export { AgentFeature } from './AgentFeature'
export { useAgent } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { AgentConfig, AgentState } from './types'
