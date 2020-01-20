import {IOCError} from './IOCError'

class InstantiationError extends IOCError {
  constructor(key, error) {
    super(`(${IOCError.keyToString(key)}) instantiation error`, error)
  }
}

export {InstantiationError}
