import {expect} from 'chai'
import {iocInjector, iocModule} from '../main/index'
import {ModuleDoesNotExistError} from '../main/ioc/error/ModuleDoesNotExistError'
import {ModuleInitializationError} from '../main/ioc/error/ModuleInitializationError'

describe('ioc validation test', () => {
  it('should fail if no module is given', () => {
    expect(() => iocModule({module: null, initializer: () => {}})).to.throw(
      ModuleInitializationError
    )
  })

  it('should fail if trying to inject from an unexisting module', () => {
    iocModule({module: 'my module', initializer: () => {}})
    expect(() => iocInjector('invent module')('whatever')).to.throw(
      ModuleDoesNotExistError
    )
  })

  it('should fail if the initializer fails', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: () => {
          throw new Error('forced initialization fail')
        }
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail if an eager instance creation fails', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton(
            'should fail',
            () => {
              throw new Error('forced initialization fail')
            },
            false
          )
        }
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail if instance keys are duplicated', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('key1', () => '1')
          singleton('key1', () => '2')
        }
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail if instance key has no value', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton(null, () => {})
        }
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail if instance builder is not a function', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', {})
        }
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail if the passed instance adapter is not a function', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        },
        adapter: {}
      })
    ).to.throw(ModuleInitializationError)
  })

  it('should fail trying to initalize without parameters', () => {
    expect(() => iocModule()).to.throw(ModuleInitializationError)
  })
})
