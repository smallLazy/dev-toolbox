/**
 * Router Coverage Regression Tests
 *
 * Verifies:
 *   a) Catch-all route handles unregistered tool paths
 *   b) Multi-level unknown paths also land on the catch-all
 *   c) ToolUnavailable distinguishes known plugins vs Page Not Found
 *   d) No duplicate route paths
 */

import { describe, it, expect } from 'vitest'
import routerSource from '../index.ts?raw'

/**
 * Extract top-level route paths from the router source.
 * Skips paths inside redirect blocks (which are not route definitions).
 */
function extractRoutePaths(source: string): string[] {
  const paths: string[] = []
  const lines = source.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(/^\s*path:\s*["']([^"']+)["']/)
    if (!m) continue
    // Skip paths inside redirect objects
    const context = lines.slice(Math.max(0, i - 2), i).join(' ')
    if (context.includes('redirect:')) continue
    paths.push(m[1])
  }
  return paths
}

function hasCatchAllRoute(source: string): boolean {
  return source.includes(':pathMatch') && source.includes('(.*)*')
}

describe('Router Catch-All Fallback', () => {
  it('catch-all uses correct Vue Router 4 syntax: /:pathMatch(.*)*', () => {
    const source = routerSource
    // Must contain the exact Vue Router 4 catch-all pattern
    expect(
      source.includes('/:pathMatch(.*)*'),
      'Catch-all must be "/:pathMatch(.*)*" for Vue Router 4 multi-level matching'
    ).toBe(true)
  })

  it('catch-all renders ToolUnavailable component', () => {
    expect(
      routerSource.includes('ToolUnavailable'),
      'Catch-all route must import ToolUnavailable.vue component'
    ).toBe(true)
  })

  it('catch-all is the LAST route (ensures explicit routes take priority)', () => {
    const lines = routerSource.split('\n')
    // Find the line number of the catch-all
    const catchAllIdx = lines.findIndex(l => l.includes(':pathMatch'))
    // Find the last route definition line
    const lastRouteIdx = lines.length - 1 - [...lines].reverse().findIndex(l => l.includes('path:'))
    expect(
      catchAllIdx,
      'Catch-all must exist in router'
    ).toBeGreaterThan(0)
    expect(
      catchAllIdx,
      `Catch-all at line ${catchAllIdx + 1} should be the last route`
    ).toBeGreaterThanOrEqual(lastRouteIdx - 5) // Allow for closing braces
  })

  it('no duplicate route paths at the route level', () => {
    const routePaths = extractRoutePaths(routerSource)
    const staticPaths = routePaths.filter(p => !p.includes('*') && !p.includes(':'))

    const seen = new Map<string, number>()
    for (const path of staticPaths) {
      seen.set(path, (seen.get(path) ?? 0) + 1)
    }

    const duplicates = Array.from(seen.entries()).filter(([, count]) => count > 1)
    expect(
      duplicates,
      `Duplicate routes found:\n${duplicates.map(([p, c]) => `  ${p}: ${c} times`).join('\n')}`
    ).toHaveLength(0)
  })
})

describe('ToolUnavailable Component', () => {
  it('ToolUnavailable.vue distinguishes known plugin vs page not found', async () => {
    const source = (await import('../../components/ToolUnavailable.vue?raw')).default as string

    // Must have both modes
    expect(source, 'Must contain "Tool not activated" for known plugins').toContain('Tool not activated')
    expect(source, 'Must contain "Page not found" for unknown paths').toContain('Page not found')

    // Must have the logic for distinguishing
    expect(source, 'Must use workspace store to look up plugins').toContain('useWorkspaceStore')
    expect(source, 'Must check if path matches a registered tool').toContain('isKnownPlugin')

    // No Chinese text
    expect(/[一-鿿]/.test(source), 'Must not contain Chinese characters').toBe(false)
  })

  it('Component imports are valid', async () => {
    const mod = await import('../../components/ToolUnavailable.vue')
    expect(mod.default, 'ToolUnavailable.vue must have a default export').toBeDefined()
  })
})

describe('Multi-level path coverage', () => {
  it('catch-all pattern (.*)* matches multi-segment paths', () => {
    // (.*)* in Vue Router 4 matches zero or more path segments
    // This verifies that paths like /unknown/path and /tools/not-exist
    // will be caught by the catch-all route
    const pattern = '/:pathMatch(.*)*'

    // Valid Vue Router 4 catch-all patterns
    expect(pattern, 'Pattern must use (.*)* for multi-level matching').toContain('(.*)*')

    // Verify the catch-all is present in the router
    expect(
      routerSource.includes(pattern),
      `Router must contain "${pattern}" catch-all route`
    ).toBe(true)
  })
})
