/** Prompt Plugin — Public API */

export { default as PromptView } from './PromptView.vue'
export { PromptFeature } from './PromptFeature'
export { usePrompt } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { PromptConfig, PromptState } from './types'
