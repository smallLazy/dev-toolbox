import { describe, expect, it } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const generatorPath = path.resolve(__dirname, '..', 'create-plugin.ts')

describe('create-plugin template output', () => {
  it('uses ToolLayout workspace components in generated views', () => {
    const source = fs.readFileSync(generatorPath, 'utf-8')
    expect(source).toContain("import ToolLayout from '@/templates/ToolLayout.vue'")
    expect(source).toContain("import ToolWorkspace from '@/templates/ToolWorkspace.vue'")
    expect(source).toContain("import InputOutputPanel from '@/templates/InputOutputPanel.vue'")
    expect(source).toContain("import ToolActionBar from '@/templates/ToolActionBar.vue'")
    expect(source).toContain("import ToolStatusBar from '@/templates/ToolStatusBar.vue'")
  })

  it('does not generate legacy card/action-bar layout or emoji template icons', () => {
    const source = fs.readFileSync(generatorPath, 'utf-8')
    expect(source).not.toContain('<div class="card">')
    expect(source).not.toContain('<div class="action-bar">')
    expect(source).not.toMatch(/icon:\s*'[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})
