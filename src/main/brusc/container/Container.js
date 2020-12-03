import {stringKey} from '../common/utils'

export class Container {
  constructor({instanceProviders, adapters}) {
    this._instanceProviders = instanceProviders
    this._adapters = adapters
    this._keptInstances = new Map()
    this._circularDependencyControl = new Set()
  }

  provide(key) {
    if (this._keptInstances.has(key)) {
      return this._keptInstances.get(key)
    }
    this._guardNotInCircularDependency(key)
    this._guardHasInstanceProvider(key)

    this._circularDependencyControl.add(key)
    const instanceProvider = this._instanceProviders.get(key)
    let instance = instanceProvider.provide(key)
    this._circularDependencyControl.delete(key)

    this._adapters.forEach(adapter => {
      instance = adapter.process(key, instance)
    })
    if (instanceProvider.isSingleton) {
      this._keptInstances.set(key, instance)
    }
    return instance
  }

  loadEagerInstances() {
    Array.from(this._instanceProviders.values()).forEach(
      instanceProvider =>
        instanceProvider.isEager && this.provide(instanceProvider.key)
    )
  }

  _guardNotInCircularDependency(key) {
    if (this._circularDependencyControl.has(key)) {
      throw new Error(
        `Circular dependency [${Array.from(
          this._circularDependencyControl.values()
        )
          .map(k => stringKey(k))
          .join('->')}->${stringKey(key)}]`
      )
    }
  }

  _guardHasInstanceProvider(key) {
    if (!this._instanceProviders.has(key)) {
      throw new Error(`No instance provider defined for [${stringKey(key)}]`)
    }
  }
}
