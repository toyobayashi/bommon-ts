
/**
 * Import a script file dynamicly.
 * @param src - Script src url
 * @param moduleId - {@link ModuleId}
 *
 * @public
 */
export declare function dynamicImport(src: string, moduleId?: ModuleId): Promise<any>;

/**
 * @remarks
 * type {@link ModuleId}
 *
 * @public
 */
export declare type DynamicImportFunction = (src: string, moduleId?: ModuleId) => Promise<any>;

/**
 * Get the version code.
 * @public
 */
export declare function getVersion(): string;

declare class Module {
    id: ModuleId;
    parent: Module | null;
    loaded: boolean;
    exports: any;
    children: Module[];
    constructor(id: ModuleId, parent: Module | null);
    require(moduleId: ModuleId): any;
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
export declare interface ModuleCache {
    [name: string]: Module;
}

/**
 * @public
 */
export declare type ModuleId = string | number;

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
export declare interface ModuleMap {
    [name: string]: ModuleWrapper;
}

/**
 * @remarks
 * interface {@link RequireFunction}
 *
 * @public
 */
export declare type ModuleWrapper = (module: Module, exports: any, require: RequireFunction) => any;

/**
 * Register a CommonJS module.
 * @param moduleId - {@link ModuleId}
 * @param fn - {@link ModuleWrapper | CommonJS wrapper function}
 * @public
 */
export declare function register(moduleId: ModuleId, fn: ModuleWrapper): void;

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
export declare interface RequireFunction {
    (moduleId: ModuleId): any;
    /** {@link ModuleMap} */
    modules: ModuleMap;
    /** {@link ModuleCache} */
    cache: ModuleCache;
    main: Module | undefined;
    /** {@link DynamicImportFunction} */
    dynamicImport: DynamicImportFunction;
}

/**
 * Run the entry module.
 * @param moduleId - {@link ModuleId}
 * @public
 */
export declare function runAsMain(moduleId: ModuleId): void;

export { }

export as namespace bommon
