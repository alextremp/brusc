import {DefaultContainer} from './container/DefaultContainer'
import {ModuleDoesNotExistError} from './error/ModuleDoesNotExistError'
import {ModuleInitializationError} from './error/ModuleInitializationError'
import {InvalidModuleKeyError} from './error/InvalidModuleKeyError'
import {ChainContainer} from './container/ChainContainer'

class IOC {
  constructor() {
    this._modules = new Map()
  }

  module({module, initializer, adapter, chain}) {
    try {
      this._guardModuleNotEmpty(module)
      const container = this._updateModules(module, adapter, chain)
      initializer({
        singleton: (key, builder, lazy) =>
          container.singleton(key, builder, lazy),
        prototype: (key, builder) => container.prototype(key, builder)
      })
      container.loadEagers()
    } catch (error) {
      throw new ModuleInitializationError(module, error)
    }
  }

  injector(module) {
    this._guardModuleExists(module)
    return key => this._modules.get(module).container.provide(key)
  }

  _updateModules(module, adapter, chain) {
    let container
    const old = this._modules.get(module)
    if (!old) {
      container = new DefaultContainer({module, adapter})
    } else {
      if (old.chain) {
        container = new ChainContainer({
          module,
          adapter,
          chained: old.container
        })
      } else {
        container = new DefaultContainer({module, adapter})
      }
    }
    this._modules.set(module, {container, chain})
    return container
  }

  _guardModuleNotEmpty(module) {
    if (!module) {
      throw new InvalidModuleKeyError('Module key cannot be empty')
    }
  }

  _guardModuleExists(module) {
    if (!this._modules.has(module)) {
      throw new ModuleDoesNotExistError(module)
    }
  }
}

export {IOC}
