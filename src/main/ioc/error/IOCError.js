class IOCError extends Error {
  constructor(message, cause) {
    super()
    this.name = this.constructor.name
    this.stack = new Error(message).stack
    this.cause = cause
  }
}

export {IOCError}
