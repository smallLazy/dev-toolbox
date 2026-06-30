/**
 * Simple Dependency Injection Container
 *
 * Manages service instances with lazy initialization and singleton scope.
 * Services are created on first access and cached thereafter.
 */

export type ServiceFactory<T> = () => T

export interface ServiceDefinition<T = unknown> {
  factory: ServiceFactory<T>
  instance?: T
}

// ── Service Map Type ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ServiceMap {}

// ── Container ───────────────────────────────────────────────────────────

export class ServiceContainer<T extends Record<string, unknown> = Record<string, unknown>> {
  private definitions = new Map<string, ServiceDefinition>()

  /** Register a service factory. The service is NOT created until first access. */
  register<K extends string, V>(name: K, factory: ServiceFactory<V>): ServiceContainer<T & Record<K, V>> {
    if (this.definitions.has(name)) {
      console.warn(`[ServiceContainer] Service "${name}" is already registered. Overwriting.`)
    }
    this.definitions.set(name, { factory })
    return this as unknown as ServiceContainer<T & Record<K, V>>
  }

  /** Get a service instance. Creates it on first access (lazy singleton). */
  get<K extends string>(name: K): T extends Record<K, infer V> ? V : unknown {
    const def = this.definitions.get(name)
    if (!def) {
      throw new Error(`[ServiceContainer] Service "${name}" is not registered.`)
    }
    if (!def.instance) {
      def.instance = def.factory()
    }
    return def.instance as T extends Record<K, infer V> ? V : unknown
  }

  /** Check if a service is registered. */
  has(name: string): boolean {
    return this.definitions.has(name)
  }

  /** Remove a service. Its instance will be garbage collected. */
  remove(name: string): void {
    this.definitions.delete(name)
  }

  /** Get all registered service names. */
  keys(): string[] {
    return Array.from(this.definitions.keys())
  }

  /** Remove all services. */
  clear(): void {
    this.definitions.clear()
  }
}

// ── Factory ─────────────────────────────────────────────────────────────

/** Create a new empty service container. */
export function createServiceContainer(): ServiceContainer {
  return new ServiceContainer()
}
