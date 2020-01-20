import {IOCError} from './IOCError'

class ModuleDoesNotExistError extends IOCError {
  constructor(key) {
    super(`(${key}) module does not exist`)
  }
}

export {ModuleDoesNotExistError}
