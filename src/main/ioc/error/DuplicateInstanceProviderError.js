import {IOCError} from './IOCError'

class DuplicateInstanceProviderError extends IOCError {
  constructor({key}) {
    super(`(${IOCError.keyToString(key)}) duplicated provider`)
  }
}

export {DuplicateInstanceProviderError}
