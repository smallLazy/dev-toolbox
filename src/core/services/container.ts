/**
 * ServiceContainer — Typed Dependency Injection for Services
 *
 * Builds on the generic DI container with a typed service map.
 * All services are lazy singletons.
 */

import { ServiceContainer as DIContainer } from '../di'
import type { AllServices } from './types'

export class ServiceContainer {
  private container = new DIContainer()

  /** Register a service. Returns this for chaining. */
  register<K extends keyof AllServices>(
    name: K,
    factory: () => AllServices[K]
  ): this {
    this.container.register(name, factory)
    return this
  }

  /** Get a service instance. */
  get<K extends keyof AllServices>(name: K): AllServices[K] {
    return this.container.get(name) as AllServices[K]
  }

  /** Check if a service is registered. */
  has(name: string): boolean {
    return this.container.has(name)
  }

  /** Get all registered service names. */
  keys(): string[] {
    return this.container.keys()
  }

  /** Remove all services. */
  clear(): void {
    this.container.clear()
  }
}

/** Create a new typed service container. */
export function createServiceContainer(): ServiceContainer {
  return new ServiceContainer()
}
