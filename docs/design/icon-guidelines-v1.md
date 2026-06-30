# Icon Guidelines v1.0

> **规则**: 整个产品只有一套 Icon System。禁止任何地方直接 import lucide/emoji/PNG。

---

## 1. Design Principles

- **Monochrome**: All icons use `currentColor`. No multi-color except brand logos.
- **Consistent stroke**: 2px stroke-width, round caps/joins.
- **24×24 viewBox**: All icons designed on 24px grid.
- **Semantic**: Choose icons by meaning, not by appearance.

---

## 2. Icon Library

Single source: `src/design/icons/index.ts`

```
import { Icons, TOOL_ICONS, APP_ICONS, getToolIcon, ICON_SIZE } from '@/design/icons'
```

### Icons (App)
Navigation (Home, Search, ChevronRight, ExternalLink) +
Actions (Copy, Trash, Star, Refresh, Download, Upload, Play, Pause, Check, Alert, Info, X, Folder, Zap) +
App (Settings, Terminal, History, Beaker) +
Brand (PanelsTopLeft, LayoutGrid, Layers3)

### TOOL_ICONS (Tools)
json → FileJson, crypto/aes → Lock, base64 → CaseSensitive, url → Link, timestamp → Clock, hash → Hash, jwt → Shield, cloud-encrypt → Package, sql-in → Database, config/settings → Settings, hello → Beaker, home → Home

### APP_ICONS (Brand)
toolbox → Layers3, workspace → PanelsTopLeft, dashboard → LayoutGrid

### APP_ICONS (Actions)
copy → Copy, paste → Copy, clear → Trash, swap → Refresh, star → Star, history → History, settings → Settings, search → Search, download → Download, upload → Upload, play → Play, pause → Pause, check → Check, alert → Alert, info → Info, close → X, home → Home, terminal → Terminal, external → ExternalLink, folder → Folder, zap → Zap, chevronRight → ChevronRight

---

## 3. Icon Size

| Size | px | Usage |
|------|-----|-------|
| `ICON_SIZE.sm` | 14 | Badge, inline text |
| `ICON_SIZE.md` | 16 | Toolbar, Search, Form label |
| `ICON_SIZE.lg` | 18 | Sidebar nav |
| `ICON_SIZE.xl` | 20 | Sidebar active |
| `ICON_SIZE['2xl']` | 24 | Dashboard card, Page header |
| `ICON_SIZE['3xl']` | 32 | Empty state |

---

## 4. Stroke Width

```
ICON_STROKE = 2
```

All icons share stroke-width 2. Never deviate.

---

## 5. Color

```
color: currentColor
```

Icons inherit text color. Use CSS `color` property on parent.

- Default: `var(--color-neutral-70)`
- Hover: `var(--color-neutral-90)`
- Active: `var(--color-accent-primary)`

---

## 6. Prohibited

```
❌ Emoji anywhere
❌ PNG icons
❌ JPG/GIF/WebP icons
❌ Direct lucide-vue-next import
❌ Direct @lucide/vue import
❌ Custom SVG embedded in Feature
❌ Inline SVG in template
❌ Font-based icons (FontAwesome, Material Icons)
❌ Multi-color icons (except brand logo)
```

---

## 7. Adding a Tool Icon

1. Choose icon name from Lucide catalog
2. Copy SVG path data
3. Add to `src/design/icons/index.ts` → `Icons` object
4. Add mapping to `TOOL_ICONS`
5. Update Sidebar + Dashboard to use `getToolIcon(id)`

---

## 8. Code Review Checklist

```
[ ] All icons from @/design/icons?
[ ] No emoji anywhere?
[ ] No PNG/JPG/GIF?
[ ] No direct lucide import?
[ ] Using currentColor (not hardcoded fill)?
[ ] Using ICON_SIZE constant?
```

---

> **版本**: v1.0  
> **最后更新**: 2026-07-30
