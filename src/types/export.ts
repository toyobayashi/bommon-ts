import Module from '../module'

/**
 * @remarks
 * ``` ts
 * export interface ModuleMap {
 *   [name: string]: ModuleWrapper
 * }
 * ```
 * type {@link ModuleWrapper}
 * 
 * @public
 */
export interface ModuleMap {
  [name: string]: ModuleWrapper
}

/**
 * @remarks
 * ``` ts
 * export interface ModuleCache {
 *   [name: string]: Module
 * }
 * ```
 * @public
 */
export interface ModuleCache {
  [name: string]: Module
}

/**
 * @remarks
 * interface {@link RequireFunction}
 * 
 * @public
 */
export type ModuleWrapper = (module: Module, exports: any, require: RequireFunction) => any

/**
 * @public
 */
export type ModuleId = string | number

/**
 * @remarks
 * ``` ts
 * export interface RequireFunction {
 *   (moduleId: ModuleId): any
 *   modules: ModuleMap
 *   cache: ModuleCache
 *   main: Module | undefined
 *   dynamicImport: DynamicImportFunction
 * }
 * ```
 * type {@link ModuleId}
 * 
 * @public
 */
export interface RequireFunction {
  (moduleId: ModuleId): any

  /** {@link ModuleMap} */
  modules: ModuleMap

  /** {@link ModuleCache} */
  cache: ModuleCache

  main: Module | undefined

  /** {@link DynamicImportFunction} */
  dynamicImport: DynamicImportFunction
}

/**
 * @remarks
 * type {@link ModuleId}
 * 
 * @public
 */
export type DynamicImportFunction = (src: string, moduleId?: ModuleId) => Promise<any>
