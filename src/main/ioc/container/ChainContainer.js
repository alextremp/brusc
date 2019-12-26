import {DefaultContainer} from './DefaultContainer'
import {InstantiationError} from '../error/InstantiationError'

class ChainContainer extends DefaultContainer {
  constructor({module, adapter, chained}) {
    super({module, adapter})
    this._chained = chained
  }

  static create({module, adapter, chained}) {
    const reAdapter = (instance, key, module) =>
      adapter(chained.adapter(instance, key, module), key, module)
    return new ChainContainer({module, adapter: reAdapter, chained})
  }

  provide(key) {
    try {
      return this._chained.has(key)
        ? this._chained.provide(key)
        : super.provide(key)
    } catch (error) {
      throw new InstantiationError(key, error)
    }
  }
}

export {ChainContainer}
