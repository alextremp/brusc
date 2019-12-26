import {IOC} from './ioc/IOC'

const shared = new IOC()

const iocReset = module => shared.clear(module)

const iocModule = ({
  module,
  initializer = () => null,
  adapter = instance => instance,
  chain = false
} = {}) => shared.module({module, initializer, adapter, chain})

const iocInjector = module => shared.injector(module)

export {iocModule, iocInjector, iocReset}
