import { ModuleId, DynamicImportFunction, RequireFunction } from './types/export'
import { assertModuleId, getPromiseConstructor, isValidModuleId } from './util'
import { registeredModules, installedModules, asyncScripts } from './cache'

class Module {
  public loaded: boolean
  public exports: any
  public children: Module[]

  constructor (public id: ModuleId, public parent: Module | null) {
    this.id = id
    this.loaded = false
    this.exports = {}
    this.parent = parent
    this.children = []
  }

  require (moduleId: ModuleId): any {
    assertModuleId(moduleId)
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    if (!registeredModules[moduleId]) throw new Error(`Module {${moduleId}} is not registered.`)
    const module = installedModules[moduleId] = new Module(moduleId, this)
    registeredModules[moduleId].call(module.exports, module, module.exports, createRequireFromModule(module))
    module.loaded = true
    this.children.push(module)
    return module.exports
  }
}

let mainModule: Module | undefined

const anonymousModule = new Module('anonymous', null)
anonymousModule.loaded = true

export { anonymousModule }

export function createDynamicImport (mod: Module): DynamicImportFunction {
  return function dynamicImport (src: string, moduleId?: ModuleId): Promise<any> {
    const Promise = getPromiseConstructor()
    if (typeof src !== 'string') throw new TypeError('Script url must be a string.')

    let promise: Promise<any>
    const loadModule = function (): any {
      if (isValidModuleId(moduleId)) {
        return mod.require(moduleId as ModuleId)
      }
    }

    if (asyncScripts[src] === 0) {
      promise = Promise.resolve()
    } else if (asyncScripts[src]) {
      promise = asyncScripts[src] as Promise<any>
    } else {
      promise = loadScript(src, asyncScripts)
    }

    return promise.then(loadModule)
  }
}

export default Module

export function createRequireFromModule (mod: Module): RequireFunction {
  function require (moduleId: ModuleId): any {
    return mod.require(moduleId)
  }

  require.modules = registeredModules
  require.cache = installedModules
  require.main = mainModule
  require.dynamicImport = createDynamicImport(mod)

  return require
}

/**
 * Run the entry module.
 * @param moduleId - {@link ModuleId}
 * @public
 */
export function runAsMain (moduleId: ModuleId): void {
  assertModuleId(moduleId)
  if (mainModule === undefined) {
    if (!registeredModules[moduleId]) throw new Error(`Module {${moduleId}} is not registered.`)
    const module = mainModule = installedModules[moduleId] = new Module(moduleId, null)
    registeredModules[moduleId].call(module.exports, module, module.exports, createRequireFromModule(module))
    module.loaded = true
  } else {
    throw new Error('Call runAsMain only once.')
  }
}

function loadScript (src: string, cache: typeof asyncScripts): Promise<void> {
  const Promise = getPromiseConstructor()

  const promise = new Promise<void>(function (resolve, reject) {
    const script = document.createElement('script')

    // eslint-disable-next-line prefer-const
    let timeout: any

    script.charset = 'utf-8';
    (script as any).timeout = 120
    script.src = src

    const onScriptComplete = function (_event: Event): void {
      script.onload = null
      script.onerror = null
      clearTimeout(timeout)
      if (cache) {
        cache[src] = 0
      }
      resolve()
    }
    const onScriptError = function (_event: string | Event): void {
      script.onload = null
      script.onerror = null
      clearTimeout(timeout)
      if (cache) {
        cache[src] = undefined
      }
      reject(new Error('Failed to load script {' + src + '}.'))
    }
    timeout = setTimeout(function () {
      onScriptError({ type: 'timeout', target: script } as any)
    }, 120000)
    script.onload = onScriptComplete
    script.onerror = onScriptError
    document.head.appendChild(script)
  })

  if (cache) {
    cache[src] = promise
  }

  return promise
}
