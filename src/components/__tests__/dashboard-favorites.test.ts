/**
 * DashboardFavorites — Rendering & Design Token Regression Tests
 *
 * Verifies that the Favorites section on the Home page:
 *  1. Uses DashboardCard (not raw icon-only rendering)
 *  2. Passes :status="tool.status" for coming-soon badge support
 *  3. Shows PluginEmptyState with "No favorites" when empty
 *  4. Has favorite star functionality
 *  5. Zero emoji characters
 *  6. No hardcoded colors, spacing, or font-sizes
 *
 * Reference: CLAUDE.md — "Always / Never Do" rules
 */

import { describe, it, expect } from 'vitest'
import favoritesSource from '../DashboardFavorites.vue?raw'
import cardSource from '../DashboardCard.vue?raw'

// ── Helpers ──────────────────────────────────────────────────────────────

/** Extract scoped style block from a Vue SFC */
function extractStyles(source: string): string {
  const match = source.match(/<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/)
  if (!match) throw new Error('Could not find scoped style block')
  return match[1]
}

/** Check for raw px values that are likely spacing/sizing violations */
function findHardcodedPx(styles: string): string[] {
  // Matches property: Npx where the value could be a design token
  const violations: string[] = []
  // Look for gap, padding, margin, width, height with hardcoded px
  const pxPattern = /(gap|padding|margin(?:-top|-right|-bottom|-left)?)\s*:\s*\d+px/g
  let m: RegExpExecArray | null
  while ((m = pxPattern.exec(styles)) !== null) {
    violations.push(m[0])
  }
  return violations
}

/** Check for hardcoded hex colors */
function findHardcodedColors(styles: string): string[] {
  const hexPattern = /(color|background|border-color)\s*:\s*#[0-9a-fA-F]{3,8}/g
  const matches = styles.match(hexPattern)
  return matches ?? []
}

/** Check for hardcoded font-size in px */
function findHardcodedFontSize(styles: string): string[] {
  const fsPattern = /font-size\s*:\s*\d+px/g
  const matches = styles.match(fsPattern)
  return matches ?? []
}

// ── Emoji Check ──────────────────────────────────────────────────────────

const EMOJI_RE = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u

// ── Tests ────────────────────────────────────────────────────────────────

describe('DashboardFavorites — Structural', () => {
  it('imports DashboardCard (not raw icon rendering)', () => {
    expect(favoritesSource, 'Must import DashboardCard').toContain("import DashboardCard from './DashboardCard.vue'")
  })

  it('renders DashboardCard in the template', () => {
    expect(favoritesSource, 'Must use <DashboardCard in template').toContain('<DashboardCard')
  })

  it('passes :status="tool.status" to DashboardCard', () => {
    expect(favoritesSource, 'Must bind :status for coming-soon badge').toContain(':status="tool.status"')
  })

  it('passes :description="tool.description" to DashboardCard', () => {
    expect(favoritesSource, 'Must bind :description for tool description').toContain(':description="tool.description"')
  })

  it('passes :name="tool.name" to DashboardCard', () => {
    expect(favoritesSource, 'Must bind :name for tool name').toContain(':name="tool.name"')
  })

  it('uses variant="favorite" on DashboardCard', () => {
    expect(favoritesSource, 'Must use variant="favorite"').toContain('variant="favorite"')
  })

  it('emits select event from DashboardCard', () => {
    expect(favoritesSource, 'Must emit select on card click').toContain("@select=\"$emit('select', $event)\"")
  })

  it('uses PluginEmptyState for empty favorites', () => {
    expect(favoritesSource, 'Must import PluginEmptyState').toContain("import PluginEmptyState from '@/templates/PluginEmptyState.vue'")
  })

  it('shows "No favorites" empty state text', () => {
    expect(favoritesSource, 'Must have "No favorites" text').toContain('No favorites')
  })

  it('uses Icons.Star for the empty state icon', () => {
    expect(favoritesSource, 'Must use Icons.Star').toContain('Icons.Star')
  })

  it('conditionally shows grid vs empty state based on isEmpty', () => {
    expect(favoritesSource, 'Must check isEmpty for conditional rendering').toContain('v-if="!isEmpty"')
  })

  it('uses useFavorites composable', () => {
    expect(favoritesSource, 'Must import useFavorites composable').toContain("import { useFavorites } from '@/composables/useFavorites'")
  })

  it('destructures items and isEmpty from useFavorites', () => {
    expect(favoritesSource, 'Must destructure items and isEmpty').toContain('const { items, isEmpty } = useFavorites()')
  })
})

describe('DashboardFavorites — Design Compliance', () => {
  const styles = extractStyles(favoritesSource)

  it('has zero emoji characters', () => {
    expect(EMOJI_RE.test(favoritesSource), 'Favorites must not contain emoji').toBe(false)
  })

  it('has no hardcoded hex colors in styles', () => {
    const violations = findHardcodedColors(styles)
    expect(violations, `Hardcoded hex colors: ${violations.join(', ')}`).toHaveLength(0)
  })

  it('has no hardcoded font-size px values in styles', () => {
    const violations = findHardcodedFontSize(styles)
    expect(violations, `Hardcoded font-size: ${violations.join(', ')}`).toHaveLength(0)
  })

  it('has no hardcoded spacing px values (gap/padding/margin)', () => {
    const violations = findHardcodedPx(styles)
    expect(violations, `Hardcoded spacing: ${violations.join(', ')}`).toHaveLength(0)
  })

  it('section header uses design token for font-size', () => {
    const headerBlock = styles.match(/\.section-header\s*\{([^}]*)\}/)
    expect(headerBlock, 'Missing .section-header style').toBeTruthy()
    const fontSizeMatch = headerBlock![1].match(/font-size:\s*([^;]+)/)
    expect(fontSizeMatch, '.section-header must have font-size').toBeTruthy()
    expect(
      fontSizeMatch![1].trim(),
      '.section-header font-size must use var(--text-*)'
    ).toMatch(/var\(--text-/)
  })

  it('section header uses design token for color', () => {
    const headerBlock = styles.match(/\.section-header\s*\{([^}]*)\}/)
    const colorMatch = headerBlock![1].match(/color:\s*([^;]+)/)
    expect(colorMatch, '.section-header must have color').toBeTruthy()
    expect(
      colorMatch![1].trim(),
      '.section-header color must use var(--color-*)'
    ).toMatch(/var\(--color-/)
  })

  it('section grid uses design tokens for grid layout', () => {
    const gridBlock = styles.match(/\.section-grid\s*\{([^}]*)\}/)
    expect(gridBlock, 'Missing .section-grid style').toBeTruthy()

    const gapMatch = gridBlock![1].match(/gap:\s*([^;]+)/)
    expect(gapMatch, '.section-grid must have gap').toBeTruthy()
    expect(
      gapMatch![1].trim(),
      '.section-grid gap must use var(--dashboard-grid-gap)'
    ).toMatch(/var\(--dashboard-grid-gap\)/)

    const columnsMatch = gridBlock![1].match(/grid-template-columns:\s*([^;]+)/)
    expect(columnsMatch, '.section-grid must have grid-template-columns').toBeTruthy()
    expect(
      columnsMatch![1].trim(),
      '.section-grid columns must use var(--dashboard-card-width)'
    ).toMatch(/var\(--dashboard-card-width\)/)
  })

  it('section margin uses design token', () => {
    const sectionBlock = styles.match(/\.dashboard-section\s*\{([^}]*)\}/)
    expect(sectionBlock, 'Missing .dashboard-section style').toBeTruthy()
    const marginMatch = sectionBlock![1].match(/margin-bottom:\s*([^;]+)/)
    expect(marginMatch, '.dashboard-section must have margin-bottom').toBeTruthy()
    expect(
      marginMatch![1].trim(),
      '.dashboard-section margin must use var(--space-*)'
    ).toMatch(/var\(--space-/)
  })
})

describe('DashboardFavorites + DashboardCard — Integration', () => {
  it('DashboardCard accepts status prop for coming-soon badge', () => {
    expect(cardSource, 'DashboardCard must accept status prop').toContain('status?: string')
  })

  it('DashboardCard has card-status-badge element', () => {
    expect(cardSource, 'DashboardCard must have status badge').toContain('card-status-badge')
  })

  it('DashboardCard shows Soon badge text', () => {
    expect(cardSource, 'DashboardCard must show Soon text').toContain('Soon')
  })

  it('DashboardCard has favorite star button', () => {
    expect(cardSource, 'DashboardCard must have card-favorite class').toContain('card-favorite')
  })

  it('DashboardCard has zero emoji characters', () => {
    expect(EMOJI_RE.test(cardSource), 'DashboardCard must not contain emoji').toBe(false)
  })

  it('DashboardCard uses design tokens for all spacing in styles', () => {
    const styles = extractStyles(cardSource)
    const violations = findHardcodedPx(styles)
    expect(violations, `Hardcoded spacing in DashboardCard: ${violations.join(', ')}`).toHaveLength(0)
  })

  it('DashboardCard has no hardcoded hex colors', () => {
    const styles = extractStyles(cardSource)
    const violations = findHardcodedColors(styles)
    expect(violations, `Hardcoded hex colors in DashboardCard: ${violations.join(', ')}`).toHaveLength(0)
  })

  it('DashboardCard has no hardcoded font-size px values', () => {
    const styles = extractStyles(cardSource)
    const violations = findHardcodedFontSize(styles)
    expect(violations, `Hardcoded font-size in DashboardCard: ${violations.join(', ')}`).toHaveLength(0)
  })
})

describe('DashboardFavorites — Emit & Navigation contract', () => {
  it('defines select emit for navigation', () => {
    expect(favoritesSource, 'Must define select emit').toContain("select: [pluginId: string]")
  })

  it('emits select from DashboardCard click', () => {
    // The @select handler on DashboardCard re-emits to parent (DashboardView)
    expect(favoritesSource, 'Must forward select event').toContain("@select=\"$emit('select', $event)\"")
  })
})
