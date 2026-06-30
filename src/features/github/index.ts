/** Github Plugin — Public API */

export { default as GithubView } from './GithubView.vue'
export { GithubFeature } from './GithubFeature'
export { useGithub } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { GithubConfig, GithubState } from './types'
