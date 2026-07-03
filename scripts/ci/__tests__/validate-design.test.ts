import { describe, expect, it } from 'vitest'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { validateDesign } from '../validate-design'

function withFixture(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-design-'))
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
  fs.mkdirSync(path.join(root, 'src', 'assets'), { recursive: true })
  fs.writeFileSync(path.join(root, 'src', 'assets', 'theme.css'), `
:root {
  --color-accent-primary: rgb(0, 120, 212);
  --space-2: 8px;
  --duration-fast: 120ms;
  --ease-standard: ease;
}
`)
  return root
}

describe('validateDesign', () => {
  it('reports unknown design tokens', () => {
    const root = withFixture({
      'src/features/demo/DemoView.vue': '<template><div class="panel"></div></template><style scoped>.panel { color: var(--missing-token); }</style>',
    })
    const result = validateDesign(root)
    expect(result.errors.some(e => e.rule === 'DESIGN-007')).toBe(true)
  })

  it('forbids transition all', () => {
    const root = withFixture({
      'src/features/demo/DemoView.vue': '<template><div /></template><style scoped>.x { transition: all var(--duration-fast) var(--ease-standard); }</style>',
    })
    const result = validateDesign(root)
    expect(result.errors.some(e => e.rule === 'DESIGN-008')).toBe(true)
  })

  it('forbids old layout classes in new feature views', () => {
    const root = withFixture({
      'src/features/demo/DemoView.vue': '<template><div class="card"></div></template>',
    })
    const result = validateDesign(root)
    expect(result.errors.some(e => e.rule === 'DESIGN-009')).toBe(true)
  })

  it('forbids emoji icon fields', () => {
    const root = withFixture({
      'src/features/demo/composables.ts': "export const meta = { icon: '🔧' }\n",
    })
    const result = validateDesign(root)
    expect(result.errors.some(e => e.rule === 'DESIGN-011')).toBe(true)
  })

  it('reports hardcoded colors outside the token file', () => {
    const root = withFixture({
      'src/features/demo/DemoView.vue': '<template><div /></template><style scoped>.x { color: rgba(0, 0, 0, 0.2); }</style>',
    })
    const result = validateDesign(root)
    expect(result.errors.some(e => e.rule === 'DESIGN-010')).toBe(true)
  })
})
