import {IOCError} from './IOCError'

class InvalidAdapterError extends IOCError {
  constructor(message) {
    super(`Invalid adapter: ${message}`)
  }
}

export {InvalidAdapterError}
