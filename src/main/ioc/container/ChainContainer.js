import {DefaultContainer} from './DefaultContainer'
import {InstantiationError} from '../error/InstantiationError'

class ChainContainer extends DefaultContainer {
  constructor({module, adapter, chained}) {
    super({module, adapter})
    this._chained = chained
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
