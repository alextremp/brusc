import {expect} from 'chai'
import Brusc from '../../main'

describe('Brusc', () => {
  let inject
  beforeEach(() => {
    inject = key => inject.provide(key)
  })
  describe('given an inject definition', () => {
    it('should enable singletons injection', () => {
      const givenInstanceFactory = () => ({
        rnd: Math.random()
      })
      Brusc.define(inject)
        .singleton('x', () => givenInstanceFactory())
        .create()
      const x1 = inject('x')
      const x2 = inject('x')
      expect(x1.rnd).to.equal(x2.rnd)
    })
    it('should enable prototypes injection', () => {
      const givenInstanceFactory = () => ({
        rnd: Math.random()
      })
      Brusc.define(inject)
        .prototype('x', () => givenInstanceFactory())
        .create()
      const x1 = inject('x')
      const x2 = inject('x')
      expect(x1.rnd).to.not.equal(x2.rnd)
    })
    it('should allow instance adapters', () => {
      const givenOriginalResult = 'is adapted?'
      const givenInstanceFactory = () => ({
        f: () => givenOriginalResult
      })
      const givenAdapter = {
        name: 'Y-Adapter',
        match: key => key === 'y',
        adapt: (instance, key) => ({
          f: () => instance.f() + ' yes'
        })
      }
      Brusc.define(inject)
        .singleton('x', () => givenInstanceFactory())
        .singleton('y', () => givenInstanceFactory())
        .adapter(givenAdapter)
        .create()

      const x = inject('x')
      const y = inject('y')
      const xResult = x.f()
      const yResult = y.f()

      const expectedXResult = givenOriginalResult
      const expectedYResult = givenOriginalResult + ' yes'

      expect(xResult).to.equal(expectedXResult)
      expect(yResult).to.equal(expectedYResult)
    })
    it('should fail if adapters has not required match and adapt functions', () => {
      expect(() =>
        Brusc.define(inject)
          .adapter({adapt: () => ({})})
          .create()
      ).to.throw()
      expect(() =>
        Brusc.define(inject)
          .adapter({match: () => false})
          .create()
      ).to.throw()
    })
    it('should fail if adapter is not returning an instance', () => {
      const givenAdapter = {
        name: 'Adapter',
        match: () => true,
        adapt: () => null
      }
      Brusc.define(inject)
        .singleton('x', () => ({}))
        .adapter(givenAdapter)
        .create()
      expect(() => inject('x')).to.throw()
    })
    it('should detect circular dependencies', () => {
      Brusc.define(inject)
        // a requires b
        .singleton('a', () => ({
          b: inject('b')
        }))
        // b requires c
        .singleton('b', () => ({
          c: inject('c')
        }))
        // c requires a
        .singleton('c', () => ({
          a: inject('a')
        }))
        .create()

      expect(() => inject('a')).to.throw('Circular dependency')
    })
    it('should fail injecting without defined instance provider', () => {
      Brusc.define(inject)
        .singleton('a', () => ({}))
        .create()
      expect(() => inject('b')).to.throw()
    })
    it('should fail injecting if provider does not return an instance', () => {
      Brusc.define(inject)
        .singleton('a', () => null)
        .create()
      expect(() => inject('a')).to.throw()
    })
  })
  describe('given inject defaults', () => {
    it('should resolve with inject defaults to allow mocking', () => {
      inject.defaults = {
        k: () => 'k_mock'
      }
      Brusc.define(inject)
        .singleton('k', () => 'k_defined')
        .create()
      const k = inject('k')
      expect(k).to.equal('k_mock')
    })
  })
  describe('given invalid definition', () => {
    it('should fail if inject is not a function', () => {
      expect(() => {
        Brusc.define(null)
      }).to.throw()
    })
    it('should fail injecting before the container is created', () => {
      Brusc.define(inject).singleton('a', () => {})
      expect(() => inject('a')).to.throw()
    })
    it('should fail if no key is provided', () => {
      expect(() => Brusc.define(inject).singleton(null, () => {})).to.throw()
    })
    it('should fail if a key has not valid provider', () => {
      expect(() => {
        Brusc.define(inject).singleton('s1')
      }).to.throw()
      expect(() => {
        Brusc.define(inject).singleton('s2', {})
      }).to.throw()
      expect(() => {
        Brusc.define(inject).prototype('p1')
      }).to.throw()
      expect(() => {
        Brusc.define(inject).prototype('p2', {})
      }).to.throw()
    })
    it('should fail adding invalid instance adapters', () => {
      expect(() => {
        Brusc.define(inject).adapter()
      }).to.throw()
      expect(() => {
        Brusc.define(inject).adapter({match: {}})
      }).to.throw()
    })
    it('should fail initializing eager errored instances', () => {
      expect(() => {
        Brusc.define(inject)
          .singleton(
            's1',
            () => {
              throw new Error()
            },
            true
          )
          .create()
      }).to.throw()
    })
  })
})
