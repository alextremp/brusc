const {iocModule, iocInjector} = require('brusc')

/*

In this example, we'll use a RunkitExampleApi class as our root class that would be exported by the library.
The library will contain:
- RunkitExampleApi
- SayHelloUseCase: a sample use case to say hello
- HelloService: an interface declaring the sayHello method
- HelloServiceImpl: a sample HelloService implementation

The instances will interact this way:

caller -> RunkitExampleApi -> SayHelloUseCase -> HelloService

And the IoC will help us to mount the dependencies:

RunkitExampleApi <- SayHelloUseCase <- HelloServiceImpl <- inject

Let's see it in action!

*/

// you can use the injector directly, but would be preferable to expose a ready-to-use injector for your module, like this:

// this will be the IoC module ID to be used to declare instances and to inject them after
const IOC_MODULE = 'brusc-runkit-example'

// given a key, the iocInjector for a module will return a saved instance or create a new one
const inject = key => iocInjector(IOC_MODULE)(key)

// Let's create some classes that will use the inversion of control Container via dependency injection:

// @interface
class HelloService {
  sayHi(to) {}
}

// @interface
class HelloServiceImpl extends HelloService {
  sayHi(to) {
    return `Hello ${to}!`
  }
}

class SayHelloUseCase extends HelloService {
  constructor({helloService = inject(HelloService)} = {}) {
    super()
    this._helloService = helloService
  }

  execute({to}) {
    return this._helloService.sayHi(to)
  }
}

class RunkitExampleApi {
  constructor({sayHelloUseCase = inject(SayHelloUseCase)} = {}) {
    this._sayHelloUseCase = sayHelloUseCase
  }

  sayHello({to}) {
    return this._sayHelloUseCase.execute({to})
  }
}

// create an IoC Module with (p.ex.) your package name as the module name and an initializer function (this can use the 'singleton' for one-time initialized instances and 'prototype' for each-time that are required instances
const runkitExampleInitializer = () => {
  iocModule({
    module: IOC_MODULE,
    initializer: ({singleton}) => {
      // singletons and prototypes are declared the same way: an instance key and an instance builder:
      singleton(SayHelloUseCase, () => new SayHelloUseCase())
      // note that here there's no need to inject the instance constructor parameters, if you do it in the instance constructor itself! ;)
      singleton(HelloService, () => new HelloServiceImpl())
      // note that there's no need to keep an order for the singleton/prototype declarations
    }
  })
  // here we will create an instance that is requesting for dependency injected parameters, so it will start the dependencies instantiation. One more time, no need to declare parameters here as they're declared in the constructor itself, this will save you time when parameters evolve ;)
  return new RunkitExampleApi()
}

// let's create it all! (this could be done, for example, in your index.js)
const runkitExample = runkitExampleInitializer()
const response = runkitExample.sayHello({to: 'Brusc'})

console.log(`Response: [${response}]`)
console.log(
  'If there is a Hello Brusc message is because the use case has the implementation injected ;)'
)
