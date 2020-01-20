import {IOCError} from './IOCError'

class InvalidAdapterError extends IOCError {
  constructor(key, message) {
    super(`(${IOCError.keyToString(key)}) invalid adapter: ${message}`)
  }
}

export {InvalidAdapterError}
