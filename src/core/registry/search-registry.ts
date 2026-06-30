import type { ToolPlugin, SearchResult } from '../plugin-types'

export class SearchRegistry {
  private index = new Map<string, { manifest: ToolPlugin; keywords: string[] }>()

  register(manifest: ToolPlugin): void {
    this.index.set(manifest.id, {
      manifest,
      keywords: [
        manifest.id,
        manifest.name,
        manifest.description,
        ...manifest.searchKeywords,
      ].map((k) => k.toLowerCase()),
    })
  }

  unregister(pluginId: string): void {
    this.index.delete(pluginId)
  }

  /**
   * Fuzzy search across all registered plugins.
   * Returns results sorted by relevance score (highest first).
   */
  search(query: string): SearchResult[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAllResults()

    const results: SearchResult[] = []

    for (const [, entry] of this.index) {
      const m = entry.manifest
      let score = 0

      // Exact ID match: highest priority
      if (m.id.toLowerCase() === q) score += 100
      // Name exact match
      else if (m.name.toLowerCase() === q) score += 80
      // Name starts with
      else if (m.name.toLowerCase().startsWith(q)) score += 60
      // Name contains
      else if (m.name.toLowerCase().includes(q)) score += 40
      // Keyword match
      else if (entry.keywords.some((k) => k.includes(q))) score += 20
      // Description contains
      else if (m.description.toLowerCase().includes(q)) score += 10

      // Chinese character matching (each matched char boosts score)
      if (/[一-鿿]/.test(q)) {
        const matchCount = [...q].filter((char) => m.name.includes(char)).length
        score += matchCount * 15
      }

      if (score > 0) {
        results.push({
          pluginId: m.id,
          name: m.name,
          icon: m.icon,
          description: m.description,
          category: m.category,
          path: m.route.path,
          score,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  private getAllResults(): SearchResult[] {
    const results: SearchResult[] = []
    for (const [, entry] of this.index) {
      const m = entry.manifest
      results.push({
        pluginId: m.id,
        name: m.name,
        icon: m.icon,
        description: m.description,
        category: m.category,
        path: m.route.path,
        score: 0,
      })
    }
    return results.sort((a, b) => a.name.localeCompare(b.name))
  }

  count(): number {
    return this.index.size
  }

  clear(): void {
    this.index.clear()
  }
}
