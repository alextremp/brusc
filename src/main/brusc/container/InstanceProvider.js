import {stringKey} from '../common/utils'

export class InstanceProvider {
  constructor({key, provider, isSingleton = true, isEager = false}) {
    this._key = key
    this._provider = provider
    this._isSingleton = isSingleton
    this._isEager = isEager

    this._guardKeyHasValue()
    this._guardProviderIsFunction()
  }

  provide() {
    const instance = this._provider()
    this._guardInstanceIsGenerated(instance)
    return instance
  }

  get key() {
    return this._key
  }

  get isSingleton() {
    return this._isSingleton
  }

  get isEager() {
    return this._isEager
  }

  _guardKeyHasValue() {
    if (!this._key) {
      throw new Error('Key has no value')
    }
  }

  _guardProviderIsFunction() {
    if (typeof this._provider !== 'function') {
      throw new Error(
        `Instance provider for [${stringKey(this._key)}] must be a function`
      )
    }
  }

  _guardInstanceIsGenerated(instance) {
    if (!instance) {
      throw new Error(
        `Instance provider for [${stringKey(
          this._key
        )}] did not generate an instance`
      )
    }
  }
}
