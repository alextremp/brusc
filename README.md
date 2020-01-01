# brusc [![NPM Module](https://img.shields.io/npm/v/brusc.svg)](https://www.npmjs.com/package/brusc)

[![Build Status](https://travis-ci.org/alextremp/brusc.svg?branch=master)](https://travis-ci.org/alextremp/brusc)
[![codecov](https://codecov.io/gh/alextremp/brusc/branch/master/graph/badge.svg)](https://codecov.io/gh/alextremp/brusc)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/alextremp/brusc.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/alextremp/brusc/context:javascript)
[![Maintainability](https://api.codeclimate.com/v1/badges/82646b2e45f3f84bf903/maintainability)](https://codeclimate.com/github/alextremp/brusc/maintainability)

**brusc** is a lightweight but powerful Inversion of Control Container for Javascript projects (Node/Browser).

* :rocket: Zero dependencies, No extra requirements
* :zap: Lightweight
* :fast_forward: Easy to use
* :factory: No proxies, your provided instances will stay the same that you instantiate 
* :muscle: Improve your project architecture writing less code

## Features
* :white_check_mark: Support for declaring singletons
* :white_check_mark: Support for declaring prototypes
* :white_check_mark: Support for AOP (aspect oriented programming) using adapters 
* :white_check_mark: Does not require declaring instances in any specific order
* :white_check_mark: Inject your instances where you need them

**Index**

* [Usage](#usage)
* [Examples](#examples)
* [API Reference](#api-reference)
* [Contributing](#contributing)

## Usage

**Install**

```
npm install brusc --save
```

**Create your IoC context** to be used in the classes / functions / wherever declaring dependencies to inject:

`ioc.js`
```ecmascript 6
import {iocInjector} from 'brusc'

const IOC_CONTEXT = 'test-sample'
const inject = key => iocInjector(IOC_CONTEXT)(key)

export {inject, IOC_CONTEXT}
```

> 'test-sample' would be your package name. <br>
>
> To inject a dependency, you can use the iocInjector directly, for example:<br>
>
>> _const instance = iocInjector('TestSample')('MyInstanceImpl')_<br>
>
> But your code will look cleaner preparing the _inject_ function for a specific _key_ in your module.

**Declare your instances** into the module:

`SampleInitializer.js`
```ecmascript 6
// imports...
import {iocModule} from 'brusc'

class SampleInitializer {
  static init() {
    iocModule({
      module: IOC_CONTEXT,
      initializer: ({singleton, prototype}) => {
        singleton(SampleInterface, () => new SampleInterfaceImpl())
        singleton(SampleSingletonClass, () => new SampleSingletonClass())
        singleton('sampleSingletonFunction', () => sampleSingletonFactoryFunction())
        prototype(SamplePrototypeClass, () => new SamplePrototypeClass())
        prototype('samplePrototypeFunction', () => samplePrototypeFactoryFunction())
      }
    })
    return new Sample()
  }
}
```

**Use the injector** to assign the instances where they're needed

`Sample.js`
```ecmascript 6
// ...
class Sample {
  constructor({
    singletonA = inject(SampleSingletonClass),
    singletonB = inject(SampleSingletonClass),
    prototypeA = inject(SamplePrototypeClass),
    prototypeB = inject(SamplePrototypeClass),
    textFunction = inject('sampleSingletonFunction')
  } = {}) {
    this._singletonA = singletonA
    this._singletonB = singletonB
    this._prototypeA = prototypeA
    this._prototypeB = prototypeB
    this._textFunction = textFunction
  }
// ...
}
```

### Examples

* Check the runkit sample [here](https://npm.runkit.com/brusc)
* Check the tested sample [here](https://github.com/alextremp/brusc/tree/master/src/test/sample)

## API Reference

**brusc** exports these methods:

* **iocModule** to create a new IoC module with instances declaration
* **iocInjector** to use the module instances assigning a built instance to a variable
* **iocReset** to hard reset a module (not needed in most cases, was created for benchmarking/profiling purposes)

### iocModule

THe iocModule function creates the Container that will keep the injectable dependencies declaration.

```ecmascript 6
iocModule({
  module: 'module_id',
  initializer: ({singleton, prototype}) => {
    // ...
    singleton('instanceID1', () => new InstanceImpl1())
    singleton('instanceID2', () => new InstanceImpl2(), false)
    prototype('instanceID3', () => new InstanceImpl3())
    // ...
  },
  adapter: (instance, key, module) => myInstanceAdapter(instance),
  chain: false
})
```

Specification:

**module**

The module should be something that identifies your module (p.ex. your package name). Brusc exposes its methods over a singleton IOC manager where you'll register the module, that will be unique in the manager.<br>
In integration-test contexts, you will be able to create an upper-container to mock the instances you need to be mocked, by activating the **chain** flag in the test context module initialization.

_The module parameter is required_ 

**initializer**

The initializer function will be where you'll declare the instances to be available in your IoC module's Container.

You can declare these types of instance, by using the named parameter that will be received by Brusc invocation during the IoC module creation:

* **singleton**

A Singleton is an instance that will be instantiated 1 time, saved in the container, and each time that is required for injection, the same instance will be returned.<br>
UseCases, Services, Repositories, ... should be Singletons.

  * Parameters:
    * key: a string, class declaration, ... Anything that can identify the instance declaration. It's what will be used next to inject the dependency.
    * instance builder: a no-arg function that will be called by the IoC Container when a new instance should be created
    * lazy (defaults to _true_): a boolean, indicating if the instance should be lazy (true = will be initialized when required for dependency injection) or eager (false = will be instantiated in the IoC container after it has been initialized).

* **prototype**

A Prototype is an instance that will be instantiated each time that is required for injection.<br>
Prototypes are used when the instance should keep an internal state that may be different depending on where they're injected (p.ex. a debounce operator, may have different time limits, callback, ... but the Debouncer could be the same, instantiated for N injections).

  * Parameters: Same parameters than the _singleton_ method, excluding the _lazy_ parameter, as a Prototype will always be lazy.
  
* **adapter**

The adapter function will allow you to return an adapted instance of the received one before it's injected.<br>
This enables [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming), letting you to return:
- a Proxy over the instance (p.ex. to log every method on every instance)
- a Custom Decorator over the instance ([decorator pattern](https://en.wikipedia.org/wiki/Decorator_pattern))
- ... the modified instance you need!

Note that the adapter receives the _key_ and _module_ parameters also. The key parameter gives you the possibility to apply some features only on some keys. The module parameter is intended to be used in big/modular projects to apply AOP features at top-level initialization, to all containers instances, or to some modules only.

* **chain** 

The chain boolean (defaults to false) allows you to call the iocModule method, more than once.<br>
* When chain is false, each iocModule call will replace the module's container by a new container with the received initializer function.
* When chain is true, the iocModule will create a ChainedContainer. All will be the same, but when iocModule is called another time, the new invocation will be chained to the previous container.<br>
  * In that case, when any instance is requested for injection, the IoC Chained Container will lookup the first container initializer for the instance, return it if it's found, and look up for the second container initializer if the first did not resolved to any instance.
  
### iocInjector

The iocInjector gives access to the injectable dependencies from the Container.

```ecmascript 6
const myInstance = iocInjector('module_id')('key')
```

It can be used that way but **a cleaner/maintenable usage**, would be to declare the prepared injector for the module this way:
 
```ecmascript 6
const inject = iocInjector('module_id')
//...
const myInstance = inject('key')
```

Specification:

* **module**

The module ID. [See the iocModule section](#iocmodule) for details.

* **key**

The key that identifies an injectable dependency from the IoC container.<br>
It's the key used in a **singleton** or a **prototype** declaration.

**Trying to inject a dependency that is not declared in the container will cause an exception**. 


## Contributing

:wrench: Maintenance info

### Available Scripts

_npm run_...
* **phoenix** to reset the project reinstalling its dependencies
* **lint** to check the code format
* **test** to run the project tests
* **check** to run both lint&test
* **coverage** to get an html test coverage report
* **build** to build the project
* **versiona** to publish a new version of the library (in Travis CI)

### Create a PR

Use the PR template to explain the better possible:
* Why the PR should be merged
* How can be checked

### Deploying

This project uses Travis CI for:
* PR validation
* Merge to master validation
* NPM publications on Release tag creation

To create a new Release, take in mind:
* The Release Tag must be named *vX.Y.Z* where X.Y.Z are the _semver_ numbers that will correspond to the published package's version.
* Travis CI will launch [versiona](https://www.npmjs.com/package/versiona) which will:
  * Update the package.json to the X.Y.Z version set in the Release Tag
  * Publish the NPM package with the X.Y.Z version


