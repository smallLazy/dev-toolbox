/**
 * PluginPermissions — Declarative permission definitions.
 */

import type { PermissionDef } from './PluginManifest'

export function createPermission(id: string, description?: string): PermissionDef {
  return { id, description }
}

/** Well-known permission constants. */
export const Permissions = {
  CLIPBOARD_READ: 'clipboard:read',
  CLIPBOARD_WRITE: 'clipboard:write',
  STORAGE_READ: 'storage:read',
  STORAGE_WRITE: 'storage:write',
  NETWORK: 'network',
  FILE_SYSTEM: 'file-system',
  AI_CHAT: 'ai:chat',
} as const

export function createPermissions(
  ids: (string | PermissionDef)[]
): PermissionDef[] {
  return ids.map((id) =>
    typeof id === 'string' ? createPermission(id) : id
  )
}
