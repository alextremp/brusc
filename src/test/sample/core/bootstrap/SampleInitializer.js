import {iocModule} from '../../../../main'
import {IOC_CONTEXT} from '../context/ioc'
import {SampleInterface} from '../SampleInterface'
import {SampleInterfaceImpl} from '../SampleInterfaceImpl'
import {SampleSingletonClass} from '../SampleSingletonClass'
import {sampleSingletonFactoryFunction} from '../sampleSingletonFactoryFunction'
import {SamplePrototypeClass} from '../SamplePrototypeClass'
import {samplePrototypeFactoryFunction} from '../samplePrototypeFactoryFunction'
import {Sample} from '../Sample'

class SampleInitializer {
  static init() {
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
    return new Sample()
  }
}

export {SampleInitializer}
