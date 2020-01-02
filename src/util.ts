import { ModuleId } from './types/export'

export function isValidModuleId (moduleId?: ModuleId): boolean {
  return (typeof moduleId === 'string' && moduleId !== '') || typeof moduleId === 'number'
}

export function assertModuleId (moduleId: ModuleId): void {
  if (!isValidModuleId(moduleId)) {
    throw new TypeError('Module ID must be a non-null string or a number.')
  }
}

export function getPromiseConstructor (): PromiseConstructor {
  if (typeof Promise !== 'function') throw new Error('Your browser does not support Promise.')
  return Promise
}
