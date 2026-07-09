---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Beta Readiness Checklist v1.0

> **Sprint**: 1.9 — Beta Readiness
> **Target**: v1.0.0-beta.1 Release Ready
> **Status**: Pending verification

---

## Gate 1: Window Polish

- [ ] Window opens centered on screen
- [ ] Window respects minimum size (800x600)
- [ ] Window title displays "Dev Toolbox"
- [ ] Window is resizable
- [ ] Window close/minimize/zoom behave correctly
- [ ] macOS traffic lights positioned correctly
- [ ] App icon displays in Dock (macOS) / Taskbar (Windows)
- [ ] Retina/high-DPI rendering is crisp

## Gate 2: Keyboard Experience

- [ ] Tab navigates forward through focusable elements
- [ ] Shift+Tab navigates backward
- [ ] Arrow keys work in Command Palette (up/down navigation)
- [ ] Enter executes selected Command Palette item
- [ ] Escape closes Command Palette
- [ ] Cmd+K opens Command Palette
- [ ] Focus ring is visible on all interactive elements
- [ ] No keyboard traps (Escape always works)

## Gate 3: About Page

- [ ] About page navigable from Sidebar footer
- [ ] About page navigable from Command Palette (search "about")
- [ ] Version displays correctly (matches package.json)
- [ ] Git commit hash displays correctly
- [ ] Build time displays in readable format
- [ ] Platform detection works (macOS/Windows/Linux)
- [ ] Official plugin count shows 33
- [ ] GitHub link opens in browser
- [ ] License shows MIT

## Gate 4: Empty States

- [ ] Sidebar search empty state uses PluginEmptyState
- [ ] Command Palette empty state uses PluginEmptyState
- [ ] Settings Plugins tab uses PluginEmptyState
- [ ] Dashboard Recent empty state uses PluginEmptyState
- [ ] Dashboard Favorites empty state uses PluginEmptyState
- [ ] No inline empty state divs/p-elements remain

## Gate 5: First Launch Experience

- [ ] Welcome dashboard shows when no recent tools AND no favorites
- [ ] Welcome hero displays app branding icon + title + description
- [ ] Quick Start section shows JSON, Base64, Timestamp cards
- [ ] Quick Start cards are clickable and navigate correctly
- [ ] Keyboard hint "Press Cmd+K" is displayed
- [ ] After first tool use, Welcome disappears and normal dashboard appears
- [ ] After favoriting a tool, Welcome disappears

## Gate 6: Documentation

- [ ] README has no emoji in tables
- [ ] README includes keyboard shortcuts section
- [ ] README project structure reflects current state
- [ ] README version badge current
- [ ] Beta checklist exists and is complete
- [ ] Release notes template exists

---

## Final Gate: Automated Validation

- [ ] `npx vue-tsc --noEmit` passes
- [ ] `npx tsx scripts/ci/validate-architecture.ts` passes
- [ ] `npx tsx scripts/ci/validate-design.ts` — zero new violations
- [ ] `npx tsx scripts/ci/validate-ai.ts` passes
- [ ] `npm run build` succeeds
- [ ] No console errors during normal operation
- [ ] No TODO or placeholder strings visible to user
- [ ] No dead links or broken routes

---

> **Next**: Sprint 02 — Official Plugin Development (Base64, UUID, Timestamp, Regex)
