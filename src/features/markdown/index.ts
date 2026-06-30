/** Markdown Plugin — Public API */

export { default as MarkdownView } from './MarkdownView.vue'
export { MarkdownFeature } from './MarkdownFeature'
export { useMarkdown } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { MarkdownConfig, MarkdownState } from './types'
