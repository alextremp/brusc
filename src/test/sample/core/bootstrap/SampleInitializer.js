import {iocModule} from '../../../../main'
import {IOC_CONTEXT} from '../context/ioc'
import {SampleInterface} from '../SampleInterface'
import {SampleInterfaceImpl} from '../SampleInterfaceImpl'
import {SampleSingletonClass} from '../SampleSingletonClass'
import {sampleSingletonFactory} from '../sampleSingletonFactoryFunction'
import {SamplePrototypeClass} from '../SamplePrototypeClass'
import {samplePrototypeFactory} from '../samplePrototypeFactoryFunction'
import {Sample} from '../Sample'

class SampleInitializer {
  static init() {
    iocModule({
      module: IOC_CONTEXT,
      initializer: ({singleton, prototype}) => {
        singleton(SampleInterface, () => new SampleInterfaceImpl())
        singleton(SampleSingletonClass, () => new SampleSingletonClass())
        singleton('sampleSingletonFactory', () => sampleSingletonFactory())
        prototype(SamplePrototypeClass, () => new SamplePrototypeClass())
        prototype('samplePrototypeFactory', () => samplePrototypeFactory())
      }
    })
    return new Sample()
  }
}

export {SampleInitializer}
