import {IOCError} from './IOCError'

class EmptyAdaptedInstanceError extends IOCError {
  constructor(key) {
    super(`(${IOCError.keyToString(key)}) adapter did not return a value`)
  }
}

export {EmptyAdaptedInstanceError}
