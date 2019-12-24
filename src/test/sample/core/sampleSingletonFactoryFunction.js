import {inject} from './context/ioc'

export const sampleSingletonFactory = ({
  open = inject('samplePrototypeFactory'),
  close = inject('samplePrototypeFactory')
} = {}) => text => `${open(text)}${text}${close(text)}`
