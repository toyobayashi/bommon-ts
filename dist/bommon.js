(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.bommon = {}));
}(this, (function (exports) { 'use strict';

  var registeredModules = {};
  var installedModules = {};
  var asyncScripts = {};

  function isValidModuleId(moduleId) {
      return (typeof moduleId === 'string' && moduleId !== '') || typeof moduleId === 'number';
  }
  function assertModuleId(moduleId) {
      if (!isValidModuleId(moduleId)) {
          throw new TypeError('Module ID must be a non-null string or a number.');
      }
  }
  function getPromiseConstructor() {
      if (typeof Promise !== 'function')
          throw new Error('Your browser does not support Promise.');
      return Promise;
  }

  var Module = /** @class */ (function () {
      function Module(id, parent) {
          this.id = id;
          this.parent = parent;
          this.id = id;
          this.loaded = false;
          this.exports = {};
          this.parent = parent;
          this.children = [];
      }
      Module.prototype.require = function (moduleId) {
          assertModuleId(moduleId);
          if (installedModules[moduleId]) {
              return installedModules[moduleId].exports;
          }
          if (!registeredModules[moduleId])
              throw new Error("Module {" + moduleId + "} is not registered.");
          var module = installedModules[moduleId] = new Module(moduleId, this);
          registeredModules[moduleId].call(module.exports, module, module.exports, createRequireFromModule(module));
          module.loaded = true;
          this.children.push(module);
          return module.exports;
      };
      return Module;
  }());
  var mainModule;
  var anonymousModule = new Module('anonymous', null);
  anonymousModule.loaded = true;
  function createDynamicImport(mod) {
      return function dynamicImport(src, moduleId) {
          if (typeof window === 'undefined') {
              throw new Error('dynamicImport can not be called from non-browser environment.');
          }
          var Promise = getPromiseConstructor();
          if (typeof src !== 'string')
              throw new TypeError('Script url must be a string.');
          var promise;
          var loadModule = function () {
              if (isValidModuleId(moduleId)) {
                  return mod.require(moduleId);
              }
          };
          if (asyncScripts[src] === 0) {
              promise = Promise.resolve();
          }
          else if (asyncScripts[src]) {
              promise = asyncScripts[src];
          }
          else {
              promise = loadScript(src, asyncScripts);
          }
          return promise.then(loadModule);
      };
  }
  function createRequireFromModule(mod) {
      function require(moduleId) {
          return mod.require(moduleId);
      }
      require.modules = registeredModules;
      require.cache = installedModules;
      require.main = mainModule;
      require.dynamicImport = createDynamicImport(mod);
      return require;
  }
  /**
   * Run the entry module.
   * @param moduleId - {@link ModuleId}
   * @public
   */
  function runAsMain(moduleId) {
      assertModuleId(moduleId);
      if (mainModule === undefined) {
          if (!registeredModules[moduleId])
              throw new Error("Module {" + moduleId + "} is not registered.");
          var module = mainModule = installedModules[moduleId] = new Module(moduleId, null);
          registeredModules[moduleId].call(module.exports, module, module.exports, createRequireFromModule(module));
          module.loaded = true;
      }
      else {
          throw new Error('Call runAsMain only once.');
      }
  }
  function loadScript(src, cache) {
      var Promise = getPromiseConstructor();
      var promise = new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          // eslint-disable-next-line prefer-const
          var timeout;
          script.charset = 'utf-8';
          script.timeout = 120;
          script.src = src;
          var onScriptComplete = function (_event) {
              script.onload = null;
              script.onerror = null;
              clearTimeout(timeout);
              if (cache) {
                  cache[src] = 0;
              }
              resolve();
          };
          var onScriptError = function (_event) {
              script.onload = null;
              script.onerror = null;
              clearTimeout(timeout);
              if (cache) {
                  cache[src] = undefined;
              }
              reject(new Error('Failed to load script {' + src + '}.'));
          };
          timeout = setTimeout(function () {
              onScriptError();
          }, 120000);
          script.onload = onScriptComplete;
          script.onerror = onScriptError;
          document.head.appendChild(script);
      });
      if (cache) {
          cache[src] = promise;
      }
      return promise;
  }

  /**
   * Register a CommonJS module.
   * @param moduleId - {@link ModuleId}
   * @param fn - {@link ModuleWrapper | CommonJS wrapper function}
   * @public
   */
  function register(moduleId, fn) {
      assertModuleId(moduleId);
      if (typeof fn !== 'function')
          throw new TypeError('Module body must be a function.');
      if (registeredModules[moduleId]) {
          if (typeof console !== 'undefined') {
              console.warn && console.warn("Module {" + moduleId + "} has been registered.");
          }
          return;
      }
      registeredModules[moduleId] = fn;
  }
  var _dynamicImport = createDynamicImport(anonymousModule);
  /**
   * Import a script file dynamicly.
   * @param src - Script src url
   * @param moduleId - {@link ModuleId}
   *
   * @public
   */
  function dynamicImport(src, moduleId) {
      return _dynamicImport(src, moduleId);
  }
  /**
   * Get the version code.
   * @public
   */
  function getVersion() {
      return '2.0.1';
  }

  exports.dynamicImport = dynamicImport;
  exports.getVersion = getVersion;
  exports.register = register;
  exports.runAsMain = runAsMain;

})));
