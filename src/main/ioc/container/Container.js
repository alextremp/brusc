/**
 * @interface
 */
/* istanbul ignore next */
class Container {
  singleton(key, builder, lazy) {}

  prototype(key, builder) {}

  loadEagers() {}

  provide(key) {}

  has(key) {}
}

export {Container}
