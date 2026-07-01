/**
 * Sidebar Design Token Regression Tests
 *
 * Ensures the Sidebar search box uses Design Tokens for all visual properties.
 * Catches regressions where hardcoded px values are introduced.
 *
 * Reference: docs/design/design-system-v2.md
 *            CLAUDE.md — "Always Do: Use Design Tokens"
 */

import { describe, it, expect } from 'vitest'
import sidebarSource from '../Sidebar.vue?raw'

// Design System token values (SSOT: src/assets/theme.css)
// These are Design System constants — if they change, update here.
const TOKEN_VALUES: Record<string, number> = {
  '--space-0': 0,
  '--space-1': 4,
  '--space-2': 8,
  '--space-3': 12,
  '--space-4': 16,
  '--space-5': 20,
  '--space-6': 24,
  '--space-8': 32,
  '--space-10': 40,
  '--space-12': 48,
  '--space-16': 64,
  '--space-tight': 6,
  '--space-control-x': 10,
  '--space-control-y': 7,
  '--space-control-lg-x': 14,
}

function tokenValue(tokenName: string): number | undefined {
  return TOKEN_VALUES[tokenName]
}

// Extract the scoped style block from the Vue SFC
function extractStyles(source: string): string {
  const match = source.match(/<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/)
  if (!match) throw new Error('Could not find scoped style block in Sidebar.vue')
  return match[1]
}

describe('Sidebar Search Box — Design Token Compliance', () => {
  const styles = extractStyles(sidebarSource)

  it('search icon uses design token for left position (not hardcoded px)', () => {
    const svgBlock = styles.match(/\.search-svg\s*\{([^}]*)\}/)
    expect(svgBlock, 'Missing .search-svg style block').toBeTruthy()

    const leftMatch = svgBlock![1].match(/left:\s*([^;]+)/)
    expect(leftMatch, '.search-svg must have left property').toBeTruthy()
    expect(
      leftMatch![1].trim(),
      '.search-svg left must use a design token'
    ).toMatch(/var\(--/)
  })

  it('search input padding uses design tokens (no hardcoded px)', () => {
    const inputBlock = styles.match(/\.search-input\s*\{([^}]*)\}/)
    expect(inputBlock, 'Missing .search-input style block').toBeTruthy()

    const paddingMatch = inputBlock![1].match(/padding:\s*([^;]+)/)
    expect(paddingMatch, '.search-input must have padding property').toBeTruthy()
    const padding = paddingMatch![1].trim()

    const parts = padding.split(/\s+/)
    for (const part of parts) {
      expect(part, `padding value "${part}" must use a design token`).toMatch(/var\(--/)
    }
  })

  it('padding-left token value is sufficient to clear 14px search icon', () => {
    const inputBlock = styles.match(/\.search-input\s*\{([^}]*)\}/)
    const paddingMatch = inputBlock![1].match(/padding:\s*([^;]+)/)
    const padding = paddingMatch![1].trim()
    const parts = padding.split(/\s+/)

    // padding shorthand (4 values): top right bottom left
    let paddingLeftToken: string
    if (parts.length >= 4) {
      paddingLeftToken = parts[3]
    } else if (parts.length === 2) {
      paddingLeftToken = parts[1]
    } else {
      paddingLeftToken = parts[0]
    }

    const tokenMatch = paddingLeftToken.match(/var\((--[\w-]+)\)/)
    expect(tokenMatch, `Could not extract token from "${paddingLeftToken}"`).toBeTruthy()

    const tokenName = tokenMatch![1]
    const value = tokenValue(tokenName)
    expect(value, `Unknown token "${tokenName}" — add it to TOKEN_VALUES in this test`).toBeDefined()

    // Search icon is at left:10px and is 14px wide (occupies 10px-24px).
    // padding-left must be ≥ 24px to prevent text/icon overlap.
    expect(
      value!,
      `Token "${tokenName}" = ${value}px, must be ≥ 24px to clear search icon`
    ).toBeGreaterThanOrEqual(24)
  })

  it('search kbd has right positioning', () => {
    const kbdBlock = styles.match(/\.search-kbd\s*\{([^}]*)\}/)
    expect(kbdBlock, 'Missing .search-kbd style block').toBeTruthy()
    const rightMatch = kbdBlock![1].match(/right:\s*([^;]+)/)
    expect(rightMatch, '.search-kbd must have right property').toBeTruthy()
  })

  it('no raw px values in search box left/right positioning', () => {
    const searchSvgBlock = styles.match(/\.search-svg\s*\{([^}]*)\}/)?.[1] ?? ''
    const searchInputBlock = styles.match(/\.search-input\s*\{([^}]*)\}/)?.[1] ?? ''
    const combined = searchSvgBlock + searchInputBlock

    const suspiciousPx = combined.match(/(left|right)[^:]*:\s*\d+px/g)
    if (suspiciousPx) {
      expect(
        suspiciousPx,
        `Hardcoded px in search positioning: ${suspiciousPx.join(', ')}`
      ).toHaveLength(0)
    }
  })

  it('nav-status-badge uses only design tokens (no hardcoded px or font-size)', () => {
    const badgeBlock = styles.match(/\.nav-status-badge\s*\{([^}]*)\}/)
    expect(badgeBlock, 'Missing .nav-status-badge style block').toBeTruthy()
    const badgeStyles = badgeBlock![1]

    // font-size must use a token
    const fontSizeMatch = badgeStyles.match(/font-size:\s*([^;]+)/)
    expect(fontSizeMatch, '.nav-status-badge must have font-size').toBeTruthy()
    expect(
      fontSizeMatch![1].trim(),
      '.nav-status-badge font-size must use var(--text-*)'
    ).toMatch(/var\(--text-/)

    // padding must use tokens
    const paddingMatch = badgeStyles.match(/padding:\s*([^;]+)/)
    expect(paddingMatch, '.nav-status-badge must have padding').toBeTruthy()
    const paddingParts = paddingMatch![1].trim().split(/\s+/)
    for (const part of paddingParts) {
      expect(part, `padding value "${part}" must use a design token`).toMatch(/var\(--/)
    }

    // Must NOT have hardcoded letter-spacing
    const lsMatch = badgeStyles.match(/letter-spacing/)
    expect(lsMatch, '.nav-status-badge must not have hardcoded letter-spacing').toBeNull()
  })
})
