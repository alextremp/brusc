let id = 1
class SamplePrototypeClass {
  constructor() {
    this._id = id++
  }

  get id() {
    return this._id
  }
}

export {SamplePrototypeClass}
