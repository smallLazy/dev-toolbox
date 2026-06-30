import type { ToolPlugin, PluginInstance, PluginState } from '../plugin-types'

export class ToolRegistry {
  private plugins = new Map<string, PluginInstance>()

  register(manifest: ToolPlugin): void {
    if (this.plugins.has(manifest.id)) {
      console.warn(`[ToolRegistry] Plugin "${manifest.id}" already registered. Overwriting.`)
    }
    this.plugins.set(manifest.id, {
      manifest,
      state: 'registered',
      registeredAt: Date.now(),
      activatedAt: null,
      errorMessage: null,
    })
  }

  unregister(id: string): void {
    this.plugins.delete(id)
  }

  setState(id: string, state: PluginState, errorMessage?: string): void {
    const instance = this.plugins.get(id)
    if (!instance) return
    instance.state = state
    if (state === 'active') instance.activatedAt = Date.now()
    if (state === 'error') instance.errorMessage = errorMessage ?? null
    if (state === 'registered') {
      instance.activatedAt = null
      instance.errorMessage = null
    }
  }

  get(id: string): PluginInstance | undefined {
    return this.plugins.get(id)
  }

  getManifest(id: string): ToolPlugin | undefined {
    return this.plugins.get(id)?.manifest
  }

  getAll(): PluginInstance[] {
    return Array.from(this.plugins.values())
  }

  getAllManifests(): ToolPlugin[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest)
  }

  getByCategory(category: string): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.manifest.category === category
    )
  }

  getByIds(ids: string[]): PluginInstance[] {
    return ids.map((id) => this.plugins.get(id)).filter(Boolean) as PluginInstance[]
  }

  search(query: string): PluginInstance[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAll()

    return Array.from(this.plugins.values())
      .filter((p) => {
        const m = p.manifest
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.searchKeywords.some((kw) => kw.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const scoreA = this.relevanceScore(a.manifest, q)
        const scoreB = this.relevanceScore(b.manifest, q)
        return scoreB - scoreA
      })
  }

  private relevanceScore(manifest: ToolPlugin, query: string): number {
    let score = 0
    if (manifest.id.toLowerCase() === query) score += 100
    if (manifest.name.toLowerCase().includes(query)) score += 50
    if (manifest.searchKeywords.some((kw) => kw.toLowerCase().includes(query))) score += 30
    if (manifest.description.toLowerCase().includes(query)) score += 10
    return score
  }

  count(): number {
    return this.plugins.size
  }

  categories(): string[] {
    return [...new Set(Array.from(this.plugins.values()).map((p) => p.manifest.category))]
  }

  clear(): void {
    this.plugins.clear()
  }
}
