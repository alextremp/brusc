import {iocInjector} from '../../../../main'

const IOC_CONTEXT = 'TestSample'
const inject = key => iocInjector(IOC_CONTEXT)(key)

export {inject, IOC_CONTEXT}
