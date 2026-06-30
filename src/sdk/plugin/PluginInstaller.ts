/**
 * PluginInstaller — Handles all auto-registration.
 *
 * When definePlugin() is called, the installer automatically:
 *   1. Validates the plugin definition
 *   2. Creates the PluginContext
 *   3. Registers route, commands, shortcuts, search keywords
 *   4. Sets up history tracking
 *   5. Returns a ready-to-use PluginInstance
 */

import type { PluginDefinition } from './PluginManifest'
import type { PluginContext } from './PluginContext'
import { createPluginContext } from './PluginContext'
import { createPluginLifecycle } from './PluginLifecycle'
import { createPluginAPI } from './PluginAPI'

export interface InstallerResult<
  TFeature = unknown,
  TConfig = Record<string, unknown>,
  TInput = string,
  TOutput = string,
> {
  instance: ReturnType<typeof createPluginAPI<TFeature, TConfig, TInput, TOutput>>
  context: PluginContext<TConfig, TFeature, TInput, TOutput>
  route: { path: string; component?: () => Promise<unknown> }
}

/**
 * Install a plugin from its definition.
 * This is called internally by definePlugin().
 */
export function installPlugin<
  TFeature = unknown,
  TConfig = Record<string, unknown>,
  TInput = string,
  TOutput = string,
>(
  definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>
): InstallerResult<TFeature, TConfig, TInput, TOutput> {
  // 1. Validate
  const errors = validateDefinition(definition)
  if (errors.length > 0) {
    throw new Error(`Plugin "${definition.id}" validation failed:\n${errors.join('\n')}`)
  }

  // 2. Create context
  const context = createPluginContext(definition)

  // 3. Create lifecycle
  const lifecycle = createPluginLifecycle()

  // 4. Create API
  const instance = createPluginAPI(definition, context, lifecycle)

  // 5. Resolve route
  const route = resolveRoute(definition)

  // 6. Auto-register search keywords
  if (definition.keywords && definition.keywords.length > 0) {
    context.search.register(definition.keywords)
  }

  // 7. Log installation
  context.logger.info(`Plugin installed: ${definition.id} v${definition.version ?? '1.0.0'}`)
  context.logger.info(`  Route: ${route.path}`)
  context.logger.info(`  Commands: ${definition.commands?.length ?? 0}`)
  context.logger.info(`  Shortcuts: ${definition.shortcuts?.length ?? 0}`)
  context.logger.info(`  Keywords: ${definition.keywords?.length ?? 0}`)

  return { instance, context, route } as InstallerResult<TFeature, TConfig, TInput, TOutput>
}

// ── Validation ─────────────────────────────────────────────────────────

function validateDefinition(def: PluginDefinition): string[] {
  const errors: string[] = []

  if (!def.id || !/^[a-z][a-z0-9-]*$/.test(def.id)) {
    errors.push(`  - Invalid id: "${def.id}". Must be lowercase alphanumeric with hyphens.`)
  }
  if (!def.name || def.name.trim().length === 0) {
    errors.push('  - Name is required.')
  }
  if (!def.icon) {
    errors.push('  - Icon is required.')
  }
  if (!def.route) {
    errors.push('  - Route is required.')
  }

  // Validate commands
  if (def.commands) {
    const cmdIds = new Set<string>()
    for (const cmd of def.commands) {
      if (!cmd.id) errors.push(`  - Command missing id: "${cmd.label}"`)
      if (cmdIds.has(cmd.id)) errors.push(`  - Duplicate command id: "${cmd.id}"`)
      cmdIds.add(cmd.id)
    }
  }

  return errors
}

// ── Route Resolution ───────────────────────────────────────────────────

function resolveRoute(def: PluginDefinition): { path: string; component?: () => Promise<unknown> } {
  if (typeof def.route === 'string') {
    return {
      path: def.route,
      component: def.component,
    }
  }
  return def.route
}
