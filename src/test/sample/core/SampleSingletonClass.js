let id = 1
class SampleSingletonClass {
  constructor() {
    this._id = id++
  }

  get id() {
    return this._id
  }
}

export {SampleSingletonClass}
