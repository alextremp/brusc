import {stringKey} from '../common/utils'

export class InstanceAdapter {
  constructor({name = 'UnnamedInstanceAdapter', match, adapt}) {
    this._name = name
    this._match = match
    this._adapt = adapt

    this._guardIsFunction('match', match)
    this._guardIsFunction('adapt', adapt)
  }

  process(key, instance) {
    return this._match(key) === true ? this._build(key, instance) : instance
  }

  _build(key, instance) {
    try {
      const adapted = this._adapt(instance, key)
      this._guardAdaptedInstanceExists(key, adapted)
      return adapted
    } catch (error) {
      error.message = `[${this._name}] failed to adapt [${stringKey(key)}], ${
        error.message
      }`
      throw error
    }
  }

  _guardIsFunction(property, value) {
    if (typeof value !== 'function') {
      throw new Error(`[${this._name}] ${property} must be a function`)
    }
  }

  _guardAdaptedInstanceExists(key, adapted) {
    if (!adapted) {
      throw new Error(`[${this._name}] did not generate an instance`)
    }
  }
}
