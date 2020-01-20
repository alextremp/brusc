class IOCError extends Error {
  constructor(message, cause) {
    super()
    this.message = message + (cause ? ` [${cause.message}]` : '')
    this.name = this.constructor.name
    this.stack = new Error(message).stack
    this.cause = cause
  }

  static keyToString(key) {
    return (key && key.name) || key
  }
}

export {IOCError}
