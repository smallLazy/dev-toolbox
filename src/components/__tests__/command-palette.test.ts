/**
 * Command Palette — Interaction & Design Token Regression Tests
 *
 * P0 fix #1: @mouseenter emits "hover" (highlight-only), NOT "select" (execute + close)
 * P0 fix #2: @pointerdown.prevent suppresses focus change so focusout doesn't
 *             fire BEFORE click, allowing click to execute navigation reliably.
 *             palette-panel @focusout guard still closes when focus truly leaves.
 *
 * Reference: Sidebar P0 fixes — hover must not close, click must navigate.
 */

import { describe, it, expect } from 'vitest'
import paletteSource from '../CommandPalette.vue?raw'
import paletteItemSource from '../CommandPaletteItem.vue?raw'

// ── Helpers ──────────────────────────────────────────────────────────

function extractTemplate(source: string): string {
  const match = source.match(/<template>([\s\S]*?)<\/template>/)
  if (!match) throw new Error('Could not find <template> block')
  return match[1]
}

function extractScript(source: string): string {
  const match = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!match) throw new Error('Could not find <script> block')
  return match[1]
}

function extractStyles(source: string): string {
  const match = source.match(/<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/)
  if (!match) throw new Error('Could not find <style scoped> block')
  return match[1]
}

// ── EMOJI_RE (matches common emoji ranges) ───────────────────────────

const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{200D}\u{FE0F}]/u

// ── Hardcoded color pattern (hex, rgb, rgba, hsl) ────────────────────

const HARDCODED_COLOR_RE = /(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgb\(\s*\d+|rgba\(\s*\d+|hsl\(\s*\d+|hsla\(\s*\d+)/

// ── Hardcoded px pattern ─────────────────────────────────────────────

const HARDCODED_PX_RE = /\b\d+px\b/

// =====================================================================
// CommandPalette.vue — Interaction behavior
// =====================================================================

describe('CommandPalette.vue — Interaction behavior', () => {
  const template = extractTemplate(paletteSource)
  const script = extractScript(paletteSource)

  it('CommandPaletteItem @hover only highlights, does NOT execute+close', () => {
    // After fix: @hover="selectedIndex = index" (highlight only, no execute/close)
    expect(template).toContain('@hover="selectedIndex = index"')
    // Must NOT combine hover with execute (which triggers close)
    expect(template).not.toMatch(/@hover.*execute/)
  })

  it('@select still executes and closes (triggered by pointerdown or Enter)', () => {
    // @select="selectedIndex = index; execute()" — called by:
    //   - pointerdown → emit('select') in CommandPaletteItem
    //   - (keyboard Enter → execute() directly in CommandPalette)
    expect(template).toContain('@select="selectedIndex = index; execute()"')
  })

  it('palette-panel has @focusout handler with relatedTarget guard', () => {
    // focusout must use relatedTarget — not a bare @focusout="close"
    expect(template).not.toMatch(/@focusout="close"/)
    expect(template).not.toMatch(/@focusout="close\(\)/)

    // The panel must reference onFocusOut
    expect(template).toMatch(/@focusout="onFocusOut"/)
  })

  it('onFocusOut checks relatedTarget before closing', () => {
    // Must guard: if (related && palettePanel.value?.contains(related)) return
    expect(script).toContain('relatedTarget')
    expect(script).toContain('palettePanel.value?.contains')
    expect(script).toContain('close()')
  })

  it('palette-overlay closes on self-click (background, not panel)', () => {
    // @click.self="close" — only background clicks, not children
    expect(template).toContain('@click.self="close"')
  })

  it('Escape key closes the palette', () => {
    expect(script).toContain("case 'Escape'")
    expect(script).toContain('close()')
  })

  it('Enter key executes the selected item', () => {
    expect(script).toContain("case 'Enter'")
    expect(script).toContain('execute()')
  })
})

// =====================================================================
// CommandPaletteItem.vue — Interaction behavior
// =====================================================================

describe('CommandPaletteItem.vue — Interaction behavior', () => {
  const template = extractTemplate(paletteItemSource)
  const script = extractScript(paletteItemSource)

  // ── Mouse selection: pointerdown (sole path, no click dependency) ──

  it('@pointerdown calls onPointerDown handler (not bare .prevent)', () => {
    // onPointerDown checks button===0, calls preventDefault + emit('select')
    expect(template).toContain('@pointerdown="onPointerDown"')
    expect(template).not.toContain('@pointerdown.prevent') // no longer bare .prevent
  })

  it('onPointerDown guards left button only (event.button !== 0)', () => {
    expect(script).toContain('event.button !== 0')
  })

  it('onPointerDown calls preventDefault to suppress focus change', () => {
    // preventDefault avoids focusout firing before select+execute+close
    expect(script).toContain('event.preventDefault()')
  })

  it('onPointerDown emits select directly (no click dependency)', () => {
    // pointerdown → emit('select') → parent: execute + close. No delay, no click wait.
    expect(script).toContain("emit('select')")
  })

  it('no @click — removed to prevent pointerdown+click double-execution', () => {
    // pointerdown is the sole mouse selection path. @click removed because:
    // 1. @pointerdown.prevent in Tauri WebView suppresses click generation
    // 2. Even if click fired, it would double-navigate
    // Keyboard Enter is handled by parent keydown → execute()
    expect(template).not.toContain('@click=')
  })

  // ── Hover: highlight only ──

  it('@mouseenter emits "hover" (highlight only), NOT "select"', () => {
    expect(template).toContain('@mouseenter="$emit(\'hover\')"')
    expect(template).not.toContain('@mouseenter="$emit(\'select\')"')
  })

  // ── Button semantics ──

  it('button has type="button" for correct semantics', () => {
    expect(template).toContain('type="button"')
  })

  // ── Emit definitions ──

  it('defines both "select" and "hover" emits via const emit = defineEmits', () => {
    expect(script).toContain('select: []')
    expect(script).toContain('hover: []')
    // Uses const emit = defineEmits pattern (not bare defineEmits)
    expect(script).toContain('const emit = defineEmits')
  })

  // ── No conflicting event handlers ──

  it('no @mousedown or @click to avoid event duplication', () => {
    expect(template).not.toContain('@mousedown')
    expect(template).not.toContain('@click=')
  })
})

// =====================================================================
// CommandPalette.vue — Design Token Compliance
// =====================================================================

describe('CommandPalette.vue — Design Token Compliance', () => {
  const styles = extractStyles(paletteSource)
  const template = extractTemplate(paletteSource)

  it('no emoji in template', () => {
    // Exclude the placeholder text (which contains ASCII only) and arrow chars (←↑→↓)
    // but check for actual emoji characters
    const emojiMatches = template.match(EMOJI_RE)
    expect(emojiMatches, `Emoji found: ${emojiMatches?.join(' ')}`).toBeNull()
  })

  // Note on design compliance: CommandPalette styles were not modified by
  // this fix. Pre-existing px values (width:560px, max-height:480px),
  // z-index:1000, and rgba(0,0,0,0.55) overlay are grandfathered.
  // The fix only touches script (focusout handler) and template (ref, @hover, @focusout).

  it('no new hardcoded colors introduced by this fix', () => {
    // Strip the grandfathered overlay backdrop color
    const stripped = styles.replace(/rgba\(\s*0,\s*0,\s*0,\s*0\.55\s*\)/g, '')
    expect(
      HARDCODED_COLOR_RE.test(stripped),
      `Hardcoded color found in CommandPalette styles (beyond overlay backdrop)`
    ).toBe(false)
  })
})

// =====================================================================
// CommandPaletteItem.vue — Design Token Compliance
// =====================================================================

describe('CommandPaletteItem.vue — Design Token Compliance', () => {
  const styles = extractStyles(paletteItemSource)
  const template = extractTemplate(paletteItemSource)

  it('no emoji in template', () => {
    const emojiMatches = template.match(EMOJI_RE)
    expect(emojiMatches, `Emoji found: ${emojiMatches?.join(' ')}`).toBeNull()
  })

  it('no hardcoded hex/rgb/rgba/hsl colors in styles', () => {
    expect(
      HARDCODED_COLOR_RE.test(styles),
      `Hardcoded color found in CommandPaletteItem styles`
    ).toBe(false)
  })

  // Note on design compliance: CommandPaletteItem styles were not modified
  // by this fix. Pre-existing px values (height:40px, font-size:10px, gap:1px)
  // are grandfathered. The fix only touches script template event emitters.

  it('no new hardcoded colors introduced in styles (fix scope: zero CSS changes)', () => {
    // The fix adds no new styles — verify no hardcoded color was slipped in.
    // Pre-existing transparent/currentColor keywords are allowed.
    expect(HARDCODED_COLOR_RE.test(styles)).toBe(false)
  })

  it('gap uses design token for layout gap', () => {
    const gapMatch = styles.match(/gap:\s*([^;]+)/)
    expect(gapMatch, 'palette-item should use gap').toBeTruthy()
    expect(gapMatch![1].trim()).toContain('var(--')
  })
})
