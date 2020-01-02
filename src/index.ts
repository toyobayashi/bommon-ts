import { ModuleId, ModuleWrapper, DynamicImportFunction } from './types/export'
import { registeredModules } from './cache'
import { assertModuleId } from './util'
import { anonymousModule, runAsMain, createDynamicImport } from './module'

/**
 * Register a CommonJS module.
 * @param moduleId - {@link ModuleId}
 * @param fn - {@link ModuleWrapper | CommonJS wrapper function}
 * @public
 */
export function register (moduleId: ModuleId, fn: ModuleWrapper): void {
  assertModuleId(moduleId)
  if (typeof fn !== 'function') throw new TypeError('Module body must be a function.')
  if (registeredModules[moduleId]) {
    if (typeof console !== 'undefined') {
      console.warn && console.warn(`Module {${moduleId}} has been registered.`)
    }
    return
  }
  registeredModules[moduleId] = fn
}

const _dynamicImport: DynamicImportFunction = createDynamicImport(anonymousModule)

/**
 * Import a script file dynamicly.
 * @param src - Script src url
 * @param moduleId - {@link ModuleId}
 * 
 * @public
 */
export function dynamicImport (src: string, moduleId?: ModuleId): Promise<any> {
  return _dynamicImport(src, moduleId)
}

/**
 * Get the version code.
 * @public
 */
export function getVersion (): string {
  return '2.0.0'
}

export { runAsMain }

export * from './types/export'
