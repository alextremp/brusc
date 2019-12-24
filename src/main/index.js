import {IOC} from './ioc/IOC'

const shared = new IOC()

const iocModule = ({module, initializer, adapter, chain = false} = {}) =>
  shared.module({module, initializer, adapter, chain})

const iocInjector = module => shared.injector(module)

export {iocModule, iocInjector}
