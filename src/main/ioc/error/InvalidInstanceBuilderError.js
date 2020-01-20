import {IOCError} from './IOCError'

class InvalidInstanceBuilderError extends IOCError {
  constructor(key, message) {
    super(`(${IOCError.keyToString(key)}) invalid instance builder: ${message}`)
  }
}

export {InvalidInstanceBuilderError}
