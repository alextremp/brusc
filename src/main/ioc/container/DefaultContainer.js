import {Container} from './Container'
import {DuplicateInstanceProviderError} from '../error/DuplicateInstanceProviderError'
import {InstanceKeyNotRegistedError} from '../error/InstanceKeyNotRegistedError'
import {InvalidInstanceKeyError} from '../error/InvalidInstanceKeyError'
import {InvalidInstanceBuilderError} from '../error/InvalidInstanceBuilderError'
import {InstantiationError} from '../error/InstantiationError'
import {InvalidAdapterError} from '../error/InvalidAdapterError'

class DefaultContainer extends Container {
  constructor({module, adapter = instance => instance}) {
    super()
    this._guardAdapterIsAFunction(adapter)
    this._module = module
    this._adapter = adapter
    this._registry = new Map()
    this._providers = new Map()
    this._singletons = new Map()
    this._eagers = new Set()
    this._singletonProvider = () => key => this._provideSingleton(key)
    this._prototypeProvider = () => key => this._providePrototype(key)
  }

  singleton(key, builder, lazy = true) {
    this._guardBuilderIsAFunction(key, builder)
    this._register(key, builder, this._singletonProvider())
    if (!lazy) {
      this._eagers.add(key)
    }
  }

  prototype(key, builder) {
    this._guardBuilderIsAFunction(key, builder)
    this._register(key, builder, this._prototypeProvider())
  }

  loadEagers() {
    this._eagers.forEach(key => this.provide(key))
  }

  provide(key) {
    try {
      this._guardExistsInRegistry(key)
      const provider = this._providers.get(key)
      return provider(key)
    } catch (error) {
      throw new InstantiationError(key, error)
    }
  }

  has(key) {
    return this._providers.has(key)
  }

  _provideSingleton(key) {
    if (!this._singletons.has(key)) {
      const instance = this._registry.get(key)()
      const adapted = this._adaptedInstance(key, instance)
      this._singletons.set(key, adapted)
    }
    return this._singletons.get(key)
  }

  _providePrototype(key) {
    const instance = this._registry.get(key)()
    const adapted = this._adaptedInstance(key, instance)
    return adapted
  }

  _adaptedInstance(key, instance) {
    const adapted = this._adapter(instance, key, this._module)
    if (!adapted) {
      throw new InvalidAdapterError(
        `Adapter function did not return an assignable value for [${key}]'`
      )
    }
    return adapted
  }

  _register(key, builder, provider) {
    this._guardValidKey(key)
    this._guardBuilderIsAFunction(key, provider)
    this._guardRegistryDuplication(key)
    this._providers.set(key, provider)
    this._registry.set(key, builder)
  }

  _guardRegistryDuplication(key) {
    if (this._registry.has(key)) {
      throw new DuplicateInstanceProviderError(key)
    }
  }

  _guardExistsInRegistry(key) {
    if (!this._registry.has(key)) {
      throw new InstanceKeyNotRegistedError(key)
    }
  }

  _guardValidKey(key) {
    if (!key) {
      throw new InvalidInstanceKeyError(
        'Instance provider key must be a non empty value'
      )
    }
  }

  _guardBuilderIsAFunction(key, builder) {
    if (typeof builder !== 'function') {
      throw new InvalidInstanceBuilderError(
        `Instance builder for [${key}] must be a function`
      )
    }
  }

  _guardAdapterIsAFunction(adapter) {
    if (typeof adapter !== 'function') {
      throw new InvalidAdapterError('Adapter must be a function')
    }
  }
}

export {DefaultContainer}
