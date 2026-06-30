# Interaction Guidelines v1.0

> **规则**: 所有交互必须遵循本规范。禁止 Feature 自定义动画。
> **Motion Token**: `--duration-*` `--ease-*`

---

## 1. States

### Hover
```
Duration: 120ms  Easing: ease
Effect: background-color / border-color transition
No transform unless Card (translateY(-1px))
```

### Focus
```
Duration: 180ms  Easing: ease
Effect: border-color → #0078D4, box-shadow: 0 0 0 2px accent-dim
Always visible. Never remove :focus-visible outline.
```

### Pressed (Active)
```
Duration: 80ms  Easing: ease
Effect: transform: scale(0.97), background darken
Applies to: Button, SegmentedControl, NavItem
```

### Disabled
```
Opacity: 0.35
Cursor: not-allowed
No hover/pressed effects. No pointer events.
```

### Loading
```
Spinner: 14px, 2px border, 600ms linear infinite
Button text dim, spinner replaces or prepends text
Skeleton: shimmer gradient 1.5s ease infinite
```

### Success
```
Toast: green left-border, auto-dismiss 4s
Output area: subtle blue border (#0078D4)
No green flash on content (avoid jarring transitions)
```

### Error
```
Alert: red bg (#3D1F1F), red border, red text
Field: red border + shake animation (once, 400ms)
Toast variant: error (red left-border)
```

---

## 2. Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Hover color | background, color, border-color | 120ms | ease |
| Focus ring | box-shadow, border-color | 180ms | ease |
| Card hover | transform, box-shadow | 150ms | decelerate |
| Button press | transform | 80ms | ease |
| Dialog enter | opacity, transform(scale) | 350ms | spring |
| Dialog exit | opacity | 120ms | accelerate |
| Toast enter | opacity, transform(translateY) | 180ms | decelerate |
| Toast exit | opacity, transform(translateY) | 150ms | accelerate |
| Page enter | opacity, transform(translateY 4px) | 200ms | decelerate |
| Page exit | opacity | 100ms | accelerate |
| Tooltip | opacity, transform(translateY -2px) | 150ms | decelerate |
| Dropdown | opacity, transform(translateY -4px) | 180ms | decelerate |
| Skeleton | background-position | 1.5s | ease (infinite) |
| Spinner | transform(rotate) | 600ms | linear (infinite) |

---

## 3. Motion Tokens

```css
--duration-instant:  80ms;
--duration-fast:     120ms;
--duration-normal:   180ms;
--duration-slow:     250ms;
--duration-entrance: 350ms;

--ease-standard:     cubic-bezier(0.4, 0.0, 0.2, 1.0);
--ease-decelerate:   cubic-bezier(0.0, 0.0, 0.0, 1.0);
--ease-accelerate:   cubic-bezier(0.4, 0.0, 1.0, 1.0);
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1.0);
```

---

## 4. Prohibited Patterns

```
❌ transition: all 0.3s ease          → use specific property + token duration
❌ animation: my-custom-keyframes     → use predefined motion tokens
❌ @keyframes slideIn { ... }         → use --ease-* + standard transforms
❌ setTimeout for animation timing    → use CSS transitions
❌ Different hover effects per plugin → ALL plugins use the same pattern
```

---

> **版本**: v1.0
