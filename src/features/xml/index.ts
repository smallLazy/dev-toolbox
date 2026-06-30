/** Xml Plugin — Public API */

export { default as XmlView } from './XmlView.vue'
export { XmlFeature } from './XmlFeature'
export { useXml } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { XmlConfig, XmlState } from './types'
