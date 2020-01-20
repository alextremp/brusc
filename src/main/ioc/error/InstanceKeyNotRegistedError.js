import {IOCError} from './IOCError'

class InstanceKeyNotRegistedError extends IOCError {
  constructor(key) {
    super(`(${IOCError.keyToString(key)}) not registered`)
  }
}

export {InstanceKeyNotRegistedError}
