import {expect} from 'chai'
import {iocModule, iocReset} from '../main/index'
import {inject, IOC_CONTEXT} from './sample/core/context/ioc'
import {Sample} from './sample/core/Sample'
import {SampleInterface} from './sample/core/SampleInterface'
import {SampleInterfaceImpl} from './sample/core/SampleInterfaceImpl'
import {SampleSingletonClass} from './sample/core/SampleSingletonClass'
import {sampleSingletonFactoryFunction} from './sample/core/sampleSingletonFactoryFunction'
import {SamplePrototypeClass} from './sample/core/SamplePrototypeClass'
import {samplePrototypeFactoryFunction} from './sample/core/samplePrototypeFactoryFunction'
import {ModuleDoesNotExistError} from '../main/ioc/error/ModuleDoesNotExistError'

describe('features test', () => {
  describe('given a simple container initialization', () => {
    let sample
    beforeEach(() => {
      iocModule({
        module: IOC_CONTEXT,
        initializer: ({singleton, prototype}) => {
          singleton(SampleInterface, () => new SampleInterfaceImpl())
          singleton(SampleSingletonClass, () => new SampleSingletonClass())
          singleton('sampleSingletonFunction', () =>
            sampleSingletonFactoryFunction()
          )
          prototype(SamplePrototypeClass, () => new SamplePrototypeClass())
          prototype('samplePrototypeFunction', () =>
            samplePrototypeFactoryFunction()
          )
        }
      })
      sample = new Sample()
    })

    it('should have all values initialized', () => {
      expect(sample.singletonA).to.not.undefined
      expect(sample.singletonB).to.not.undefined
      expect(sample.prototypeA).to.not.undefined
      expect(sample.prototypeB).to.not.undefined
      expect(sample.textFunction).to.not.undefined
    })

    it('should have injected same singleton instance to A & B', () => {
      expect(
        sample.singletonA,
        'singletons are not the same references'
      ).to.equal(sample.singletonB)
    })

    it('should have injected different prototype instances to A & B', () => {
      expect(
        sample.prototypeA,
        'prototypes are the same references'
      ).to.not.equal(sample.prototypeB)
    })

    it('should have injected the textFunction with the prototype dependencies', () => {
      const givenText = '123'
      const result = sample.textFunction(givenText)
      expect(result).to.equal('[*23]123[*3]')
    })

    it('should be able to inject an instance at any time', () => {
      const sampleInterface = inject(SampleInterface)
      expect(sampleInterface).to.be.an.instanceof(SampleInterfaceImpl)
    })
  })

  describe('given a container with eager instances and an adapter function', () => {
    const received = []

    beforeEach(() => (received.length = 0))

    const givenAdapter = (instance, key, module) =>
      received.push({instance, key, module})

    it('should call the adapter with the instantiation data when injecting', () => {
      iocModule({
        module: IOC_CONTEXT,
        initializer: ({singleton}) => {
          singleton(SampleInterface, () => new SampleInterfaceImpl())
        },
        adapter: givenAdapter
      })

      expect(
        received.length,
        'the adapter was called before injecting'
      ).to.equal(0)

      inject(SampleInterface)
      inject(SampleInterface)

      expect(received.length).to.equal(1)
    })

    it('should call the adapter with the instantiation data when initializing with eager instances', () => {
      iocModule({
        module: IOC_CONTEXT,
        initializer: ({singleton}) => {
          singleton(SampleInterface, () => new SampleInterfaceImpl(), false)
        },
        adapter: givenAdapter
      })

      expect(
        received.length,
        'the adapter was not called during initialization'
      ).to.equal(1)

      inject(SampleInterface)
      inject(SampleInterface)

      expect(received.length).to.equal(1)
    })
  })

  describe('given the full sample initialization', () => {
    it('should export the library facade with its injected dependencies', () => {
      const SampleInitializer = require('./sample').default
      const sample = SampleInitializer.init()
      expect(sample.singletonA).to.not.undefined
      expect(sample.singletonB).to.not.undefined
      expect(sample.prototypeA).to.not.undefined
      expect(sample.prototypeB).to.not.undefined
      expect(sample.textFunction).to.not.undefined
    })

    it('should be resetable', () => {
      require('./sample').default.init()
      expect(() => inject(SampleInterface)).to.not.throw()
      iocReset(IOC_CONTEXT)
      expect(() => inject(SampleInterface)).to.throw(ModuleDoesNotExistError)
    })

    it('should be able to mock any dependency', () => {
      const sampleSingletonFactoryMock = () => text => text + ' is mocked!'
      iocModule({
        module: IOC_CONTEXT,
        initializer: ({singleton}) => {
          singleton('sampleSingletonFunction', () =>
            sampleSingletonFactoryMock()
          )
        },
        chain: true
      })
      const SampleInitializer = require('./sample').default
      const sample = SampleInitializer.init()
      expect(sample.textFunction('123')).to.equal('123 is mocked!')
    })

    it('should be able to externally adapt any dependency', () => {
      const sampleSingletonFunctionAdapter = (instance, key) => {
        switch (key) {
          case 'sampleSingletonFunction':
            return text => `adapted:${instance(text)}`
          default:
            return instance
        }
      }
      iocModule({
        module: IOC_CONTEXT,
        adapter: sampleSingletonFunctionAdapter,
        chain: true
      })
      const SampleInitializer = require('./sample').default
      const sample = SampleInitializer.init()
      expect(sample.textFunction('123')).to.equal('adapted:[*23]123[*3]')
    })
  })
})
