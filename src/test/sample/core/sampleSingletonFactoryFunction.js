import {inject} from './context/ioc'

export const sampleSingletonFactoryFunction = ({
  open = inject('samplePrototypeFunction'),
  close = inject('samplePrototypeFunction')
} = {}) => text => `${open(text)}${text}${close(text)}`
