import {expect} from 'chai'
import {iocInjector, iocModule} from '../main/index'
import {InstantiationError} from '../main/ioc/error/InstantiationError'

describe('container validation test', () => {
  it('should fail injecting an instance for an unregistered key', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        }
      })
    ).to.not.throw()
    expect(() => iocInjector('my module')('unexisting')).to.throw(
      InstantiationError
    )
  })

  it('should fail if an instance injection fails on instantiation', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('should fail', () => {
            throw new Error('forced initialization fail')
          })
        }
      })
    ).to.not.throw()
    expect(() => iocInjector('my module')('should fail')).to.throw(
      InstantiationError
    )
  })

  it('should fail if an instance injection fails when adapting instance', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        },
        adapter: () => {
          throw new Error('forced adapter fail')
        }
      })
    ).to.not.throw()
    expect(() => iocInjector('my module')('instance')).to.throw(
      InstantiationError
    )
  })

  it('should fail if an instance injection fails because adapter does not return an instance', () => {
    expect(() =>
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        },
        adapter: () => undefined
      })
    ).to.not.throw()
    expect(() => iocInjector('my module')('instance')).to.throw(
      InstantiationError
    )
  })

  it('should fail if an instance injection fails because it is unresolved across a chain', () => {
    expect(() => {
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {},
        chain: true
      })
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        }
      })
    }).to.not.throw()
    expect(() => iocInjector('my module')('instance')).to.throw(
      InstantiationError
    )
  })

  it('should fail if an instance injection fails because its instantiation fails inside a chain', () => {
    expect(() => {
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {
            throw new Error('Forced instantiation fail')
          })
        },
        chain: true
      })
      iocModule({
        module: 'my module',
        initializer: ({singleton}) => {
          singleton('instance', () => {})
        }
      })
    }).to.not.throw()
    expect(() => iocInjector('my module')('instance')).to.throw(
      InstantiationError
    )
  })
})
