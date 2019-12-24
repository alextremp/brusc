import {inject} from './context/ioc'
import {SampleSingletonClass} from './SampleSingletonClass'
import {SamplePrototypeClass} from './SamplePrototypeClass'

class Sample {
  constructor({
    singletonA = inject(SampleSingletonClass),
    singletonB = inject(SampleSingletonClass),
    prototypeA = inject(SamplePrototypeClass),
    prototypeB = inject(SamplePrototypeClass),
    textFunction = inject('sampleSingletonFactory')
  } = {}) {
    this._singletonA = singletonA
    this._singletonB = singletonB
    this._prototypeA = prototypeA
    this._prototypeB = prototypeB
    this._textFunction = textFunction
  }

  get singletonA() {
    return this._singletonA
  }

  get singletonB() {
    return this._singletonB
  }

  get prototypeA() {
    return this._prototypeA
  }

  get prototypeB() {
    return this._prototypeB
  }

  get textFunction() {
    return this._textFunction
  }
}

export {Sample}
