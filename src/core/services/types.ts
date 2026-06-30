/**
 * Service Layer — Interface Definitions
 *
 * All services are defined as interfaces so they can be implemented
 * differently per platform (Tauri, Web, Test mock).
 */

// ── Clipboard ────────────────────────────────────────────────────────────

export interface ClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// ── Storage ──────────────────────────────────────────────────────────────

export interface StorageService {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
  clear(): Promise<void>
}

// ── Config ───────────────────────────────────────────────────────────────

export interface ConfigService {
  get<T = unknown>(pluginId: string, key: string): Promise<T | null>
  set<T = unknown>(pluginId: string, key: string, value: T): Promise<void>
  getAll(pluginId: string): Promise<Record<string, unknown>>
  delete(pluginId: string, key: string): Promise<void>
  reset(pluginId: string): Promise<void>
}

// ── Theme ────────────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light' | 'system'
export type ThemeChangedCallback = (mode: ThemeMode) => void

export interface ThemeService {
  getMode(): ThemeMode
  setMode(mode: ThemeMode): void
  onChanged(callback: ThemeChangedCallback): () => void
}

// ── Window ───────────────────────────────────────────────────────────────

export interface WindowService {
  setTitle(title: string): Promise<void>
  setSize(width: number, height: number): Promise<void>
  center(): Promise<void>
  close(): Promise<void>
}

// ── Notification ─────────────────────────────────────────────────────────

export interface ToastOptions {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  duration?: number
}

export interface NotificationService {
  toast(options: ToastOptions): string
  dismiss(toastId: string): void
  success(title: string, description?: string): void
  error(title: string, description?: string): void
  info(title: string, description?: string): void
  warning(title: string, description?: string): void
}

// ── Logger ───────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggerService {
  debug(pluginId: string, message: string, data?: unknown): void
  info(pluginId: string, message: string, data?: unknown): void
  warn(pluginId: string, message: string, data?: unknown): void
  error(pluginId: string, message: string, error?: Error): void
  setLevel(level: LogLevel): void
}

// ── Updater ──────────────────────────────────────────────────────────────

export interface UpdateInfo {
  version: string
  body?: string
  date?: string
}

export interface UpdaterService {
  checkForUpdates(): Promise<UpdateInfo | null>
}

// ── Service Map ─────────────────────────────────────────────────────────

/** Complete service map for type-safe DI container access. */
export interface AllServices {
  clipboard: ClipboardService
  storage: StorageService
  config: ConfigService
  theme: ThemeService
  window: WindowService
  notification: NotificationService
  logger: LoggerService
  updater: UpdaterService
}
