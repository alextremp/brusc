import {IOCError} from './IOCError'

class ModuleInitializationError extends IOCError {
  constructor(key, error) {
    super(`(${key}) cannot initialize module`, error)
  }
}

export {ModuleInitializationError}
