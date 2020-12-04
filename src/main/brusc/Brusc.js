import {Container} from './container/Container'
import {InstanceProvider} from './container/InstanceProvider'
import {InstanceAdapter} from './container/InstanceAdapter'
import {stringKey} from './common/utils'

export class Brusc {
  constructor(inject) {
    this._guardInjectIsFunction(inject)
    this._inject = inject
    this._defaults = inject.defaults || {}
    this._instanceProviders = new Map()
    this._adapters = []
    inject.provide = key => this._errorContainerNotCreated(key)
  }

  static define(inject) {
    return new Brusc(inject)
  }

  singleton(key, provider, isEager) {
    this._guardKeyNotDefinedYet(key)
    this._instanceProviders.set(
      key,
      new InstanceProvider({
        key,
        provider: this._defaults[key] || provider,
        isEager
      })
    )
    return this
  }

  prototype(key, provider) {
    this._guardKeyNotDefinedYet(key)
    this._instanceProviders.set(
      key,
      new InstanceProvider({
        key,
        provider: this._defaults[key] || provider,
        isSingleton: false
      })
    )
    return this
  }

  adapter({name, match, adapt} = {}) {
    this._adapters.push(new InstanceAdapter({name, match, adapt}))
    return this
  }

  create() {
    const container = new Container({
      instanceProviders: this._instanceProviders,
      adapters: this._adapters
    })
    this._inject.defaults = undefined
    this._inject.provide = key => container.provide(key)
    container.loadEagerInstances()
  }

  _guardInjectIsFunction(inject) {
    if (typeof inject !== 'function') {
      throw new Error(
        'To enable injection, inject to define must be a function'
      )
    }
  }

  _guardKeyNotDefinedYet(key) {
    if (this._instanceProviders.has(key)) {
      throw new Error(
        `[${key}] already defined, check singleton/prototype declaration key duplications`
      )
    }
  }

  _errorContainerNotCreated = key => {
    throw new Error(
      `Cannot provide [${stringKey(key)}], call the Brusc#create method first`
    )
  }
}
