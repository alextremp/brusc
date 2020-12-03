<img alt="brusc logo" src="https://repository-images.githubusercontent.com/229852502/a3866d00-2cff-11ea-9ac7-ece7762a2853" align="center" width="300">

[![NPM Module](https://img.shields.io/npm/v/brusc.svg)](https://www.npmjs.com/package/brusc)
[![Build Status](https://travis-ci.org/alextremp/brusc.svg?branch=master)](https://travis-ci.org/alextremp/brusc)
[![codecov](https://codecov.io/gh/alextremp/brusc/branch/master/graph/badge.svg)](https://codecov.io/gh/alextremp/brusc)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/alextremp/brusc.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/alextremp/brusc/context:javascript)
[![Maintainability](https://api.codeclimate.com/v1/badges/82646b2e45f3f84bf903/maintainability)](https://codeclimate.com/github/alextremp/brusc/maintainability)


# brusc 

**brusc** is a lightweight but powerful Dependency Container to enable Inversion Of Control for Javascript projects (Node/Browser).

* :rocket: Zero dependencies, No extra requirements
* :zap: Lightweight
* :fast_forward: Easy to use
* :factory: No proxies, your provided instances will stay the same that you instantiate 
* :muscle: Improve your project's architecture writing less code

# Features
* :white_check_mark: Support for declaring singletons
* :white_check_mark: Support for declaring prototypes
* :white_check_mark: Support for cross-cutting actions over registered instances 
* :white_check_mark: Does not require declaring instances in any specific order
* :white_check_mark: Inject your instances where you need them
* :white_check_mark: Easy integration testing with mocked instances support

**Index**

* [Usage](#usage)
* [Examples](#examples)
* [API Reference](#api-reference)
* [Contributing](#contributing)

# Usage

Start using Brusc:
- [Install](#install)
- [Creating an inject function](#creating-an-inject-function)
- [Defining the Brusc Container](#defining-the-brusc-container)
- [Using the inject function](#using-the-inject-function)
- [Integration testing](#integration-testing)

Also: 
- [Full Brusc API](#full-brusc-api)
- [Contributing](#contributing)

## Install

```
npm install brusc --save
```

## Creating an inject function

Create an `inject` function shared across your context to be used in the classes / functions / wherever declaring dependencies to inject:

`inject.js`
```ecmascript 6
const inject = key => inject.provide(key)
export default inject
```

> The `provide` function will be added by Brusc in next step. This is needed to be created this way in order to enable any class/function to use it like `aProperty=inject('aPropertyKey'')`.

## Defining the Brusc Container

Define your `inject` bindings to a Brusc Container:

`MovieApplicationInitializer.js`
```ecmascript 6
// imports...
import Brusc from 'brusc'
import inject from './inject'

export class MovieApplicationInitializer {
  static init() {
    Brusc.define(inject)
      .singleton('getMoviesUseCase', () => new GetMoviesUseCase())
      .singleton('saveMovieUseCase', () => new SaveMovieUseCase())
      .singleton('movieRepository', () => new MovieRepositoryHttpImpl())
      .singleton('httpClient', () => new AxiosHttpClient())
      .create()
      
    return new MovieApplication()
  } 
}
```

## Using the inject function

Use the inject function to assign the instances where they're needed.

In the last snippet, suppose that the `MovieApplication` is the library facade, which uses the Use Cases, and each one need the `MovieRepository` which also will need a Http Client to perform the actions.

After defining the `inject` function in Brusc and creating the container with instance provider declarations like `.singleton(key => instance_provider_function)` you'll be able to create each application component (use case, service, repository, ...) assigning its dependencies in the constructor (preferably) like:

`GetMoviesUseCase.js`
```ecmascript 6
import inject from './inject'

export class GetMoviesUseCase {
  constructor({movieRepository = inject('movieRepository')} = {}) {
    // ...  
  }
}
```

`MovieApplication.js`
```ecmascript 6
import inject from './inject'

export class MovieApplication {
  constructor({getMoviesUseCase = inject('getMoviesUseCase'), saveMovieUseCase = inject('saveMovieUseCase')} = {}) {
    // ...  
  }
}
```

And so on, easy like that :)

## Integration testing

You'll be able to test the your full application's facade API the same way it'll be used, allowing instance mocks replacing defined instance providers if needed:

```ecmascript 6
// ...
import inject from './inject'

describe('MovieApplication', () => {
  it('should request the movies collection', async () => {
    
    // this instance providers will be used by the Brusc Container instead of defined ones,
    // and defaults are cleared after container creation to avoid being used in next creations 
    // of another tests, so instance providers can be specified for each test and also be declared in a beforeEach. 
    inject.defaults = {
      httpClient: () => ({
        fetch: (url) => Promise.resolve(...)
      }) 
    }
    const fetchSpy = sinon.spy(inject.defaults.httpClient, 'fetch')

    const movieApplication = MovieApplicationInitializer.init()
    await movieApplication.getMovies({title: 'robocop'})
    
    expect(fetchSpy.getCall(0).args[0]).to.include('title=%robocop%')
  })
})
```

# Full Brusc API

Brusc acts as a Container builder exposing the methods:

## .define

`.define(injectFunction)`

Receives an `injectFunction` to which the Container's instance provider will be assigned in the `injectFunction.provide(key)` function.
> Should be called only once in the Brusc definition chain.

See [Creating an inject function](#creating-an-inject-function)

## .singleton

`.singleton(key, instanceProviderFunction, isEager)`

Binds a `key` to an instance provider function to declare a singleton instance in the Container.
> A singleton is an instance which after first instantiation will be kept in the container and any further requests to the container for the same key will be resolved with that first instantiated instance.
>
> This method can be called from zero times to each key/singleton instance provider binding.

- `key` _(required)_ must be any value assignable to a Map key (p.ex. a string like `'userRepository'`, but also a class declaration like `UserRepository` if using class as interface declarations would be accepted).
- `instanceProviderFunction` _(required)_ must be a function which must return a value when called, no matter if it's a constant, a function or a new class instantiation.
- `isEager` _(optional, defaults to false)_ indicates if an instance must be loaded just when the Brusc container ends with its declaration (eager), or will be instantiated on the first `inject(key)` usage (lazy).

## .prototype

`.prototype(key, instanceProviderFunction)`

Binds a `key` to an instance provider function to declare prototype instances in the Container.
> A prototype will be instantiated for each `inject(key)` usage, returning a fresh value for the injection.
>
> In most situations, singletons are preferrable over prototypes, but if a component must have a mutable state consider using prototypes.
>
> This method can be called from zero times to each key/prototype instance provider binding.

- `key` _(required)_ must be any value assignable to a Map key.
- `instanceProviderFunction` _(required)_ must be a function which must return a value when called, no matter if it's a constant, a function or a new class instantiation.

## .adapter

`.adapter({name, match, adapt})`

Allow instances to be decorated / proxied / adapted to any custom need, based on key matching, when instances are instantiated in the Container and before they are injected.

> This method can be called from zero times to each instance adapter requirement

- `name` _(optional, but defaults to UnnamedAdapter)_ the name of the adapter, only for debug / error trace intentions.
- `match(key)` _(required)_ is a function that will be used to detect instances to which apply the modification if returns `true`.
- `adapt(instance, key)` _(required)_ is a function that must return an instance which can be the original one, but also a decorated one, proxied, ... 

```ecmascript 6
.adapter({
  name: 'UseCaseTimeLogger',
  match: key => key.endsWith('UseCase'),
  adapt: (instance, key) => ({ // just for the sample, a specific class would be better :)
    execute: async params => {
      const start = Date.now()
      try {
        const result = await instance.execute(params)
        return result
      } finally {
        console.log(`${key} spent ${Date.now() - start}ms to execute`)
      }
    }
  })
})
```

In this case, instead of injecting the original instance defined with p.ex. `.singleton('getMoviesUseCase')`, the injected use case will be a decorated instance to measure the time spent in the use case's `execute` method.

## .create

`.create`

Ends with the Brusc Container declaration for the `inject` method and assigns a `provide` function to it.

So, after this, the given `inject` function will be enabled for dependency injection, using it like:
```
const anInstance = inject('anInstanceKey')
```

> Remember that to allow this, the inject function should be declared like `export const inject = key => inject.provide(key)` 

- Trying to inject a dependency before the `create` method is called on Brusc declaration will cause an exception. 
- Trying to inject a dependency that is not declared in the container as singleton or prototype will cause an exception.
- If any given instance provider function fails on instantiation or an adapter fails to do its job, the thrown error will be raised. 


# Contributing

:wrench: Maintenance info

## Available Scripts

_npm run_...
* **phoenix** to reset the project reinstalling its dependencies
* **lint** to check the code format
* **test** to run the project tests
* **check** to run both lint&test
* **coverage** to get an html test coverage report
* **build** to build the project
* **versiona** to publish a new version of the library (in Travis CI)

## Create a PR

Use the PR template to explain:
* Why the PR should be merged
* How can be checked

## Deploying

This project uses Travis CI for:
* PR validation
* Merge to master validation
* NPM publications on Release tag creation

To create a new Release, take in mind:
* The Release Tag must be named *vX.Y.Z* where X.Y.Z are the _semver_ numbers that will correspond to the published package's version.
* Travis CI will launch [versiona](https://www.npmjs.com/package/versiona) which will:
  * Update & commit to master the package.json to the X.Y.Z version set in the Release Tag
  * Publish the NPM package with the X.Y.Z version


