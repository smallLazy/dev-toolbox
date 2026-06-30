# App Icon Generation v1.0

> **Tool**: Tauri CLI (`npx tauri icon`)
> **Source requirement**: 1024x1024 PNG with transparency

---

## Prerequisites

1. A **1024x1024 PNG** source image with transparency (RGBA)
2. Tauri CLI installed (`@tauri-apps/cli` in devDependencies)

## Command

```bash
npx tauri icon ./path/to/source-icon.png
```

## Output

The command generates platform-specific icons in `src-tauri/icons/`:

| File | Platform | Usage |
|------|----------|-------|
| `32x32.png` | Windows | Taskbar, window title bar |
| `128x128.png` | macOS | Dock (1x resolution) |
| `128x128@2x.png` | macOS | Dock (2x Retina) |
| `icon.icns` | macOS | Application bundle |
| `icon.ico` | Windows | Application executable |
| `Square30x30Logo.png` | Windows | Start menu |
| `Square44x44Logo.png` | Windows | Taskbar |
| `Square71x71Logo.png` | Windows | Small tile |
| `Square89x89Logo.png` | Windows | Medium tile |
| `Square107x107Logo.png` | Windows | Large tile |
| `Square142x142Logo.png` | Windows | Wide tile |
| `Square150x150Logo.png` | Windows | App list |
| `Square284x284Logo.png` | Windows | Store listing |
| `Square310x310Logo.png` | Windows | Large tile |
| `StoreLogo.png` | Windows | Microsoft Store |
| `ios/AppIcon-*.png` | iOS | All required iOS sizes |
| `android/` | Android | Adaptive icon layers |

## Current State

The current icons are generated from a **128x128 placeholder**. For production:

1. Design a proper 1024x1024 app icon
2. Export as PNG with transparency
3. Run `npx tauri icon ./app-icon-1024.png`
4. Delete the placeholder `icon.png`

## Icon Design Guidelines

- Match the **Fluent Design dark theme** aesthetic
- Use `#0078D4` as the primary brand color
- Keep the design simple and recognizable at small sizes (32x32)
- Ensure sufficient contrast against both light and dark backgrounds
- The Layers3 icon from `APP_ICONS.toolbox` can serve as design inspiration

## Verification

After generation, verify:
- [ ] Dock icon renders crisp on macOS Retina
- [ ] Taskbar icon renders crisp on Windows
- [ ] App switcher (Cmd+Tab) shows clear icon
- [ ] No jagged edges or blur at any size
