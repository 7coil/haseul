const assert = require('assert');
const sinon = require('sinon')
const HaSeul = require('../dist/index').default;
const fs = require('fs')

describe('HaSeul', function () {
  describe('#set()', function () {
    const router = new HaSeul();

    describe('prefix', function () {
      it('should set prefix to "!" without array', function () {
        router.set('prefix', '!')
        assert.deepStrictEqual(router.get('prefix'), ['!'])
      })

      it('should set prefix to "!" with array', function () {
        router.set('prefix', ['!'])
        assert.deepStrictEqual(router.get('prefix'), ['!'])
      })

      it('should set prefixes with array', function () {
        router.set('prefix', ['!', ';'])
        assert.deepStrictEqual(router.get('prefix'), ['!', ';'])
      })
    })

    describe('case sensitive routing', function () {
      it('should enable case sensitive routing', function () {
        router.set('case sensitive routing', true)
        assert.strictEqual(router.get('case sensitive routing'), true)
      })

      it('should disable case sensitive routing', function () {
        router.set('case sensitive routing', false)
        assert.strictEqual(router.get('case sensitive routing'), false)
      })
    })
  })

  describe('#route()', function () {
    describe('case insensitive routing', function () {
      const router = new HaSeul();

      let spy = sinon.spy();

      router
        .command('abc', (args) => { spy(args); args.done() })
        .command('def', (args) => { spy(args); args.done() })

      describe('abc command', function () {
        describe('"abc"', function () {
          before(function () {
            return router.route('abc')
          })

          after(function () {
            spy.resetHistory()
          })

          it('has not errored', function () {
            sinon.assert.calledWith(spy, sinon.match.has('err', undefined))
          })

          it('calls the "abc" function', function () {
            sinon.assert.calledWith(spy, sinon.match.has('route', 'abc'))
          })

          it('calls function only once', function () {
            sinon.assert.calledOnce(spy)
          })

          it('has content of empty string', function () {
            sinon.assert.calledWith(spy, sinon.match.has('content', ''))
          })

          it('output user input matches passed in string', function () {
            sinon.assert.calledWith(spy, sinon.match.has('userInput', 'abc'))
          })
        })

        describe('"abc123"', function () {
          before(function () {
            return router.route('abc123')
          })

          after(function () {
            spy.resetHistory()
          })

          it('has not errored', function () {
            sinon.assert.calledWith(spy, sinon.match.has('err', undefined))
          })

          it('calls the "abc" function', function () {
            sinon.assert.calledWith(spy, sinon.match.has('route', 'abc'))
          })

          it('calls function only once', function () {
            sinon.assert.calledOnce(spy)
          })

          it('has "123" as content', function () {
            sinon.assert.calledWith(spy, sinon.match.has('content', '123'))
          })

          it('output user input matches passed in string', function () {
            sinon.assert.calledWith(spy, sinon.match.has('userInput', 'abc123'))
          })
        })

        describe('"abc 123"', function () {
          before(function () {
            return router.route('abc 123')
          })

          after(function () {
            spy.resetHistory()
          })

          it('has not errored', function () {
            sinon.assert.calledWith(spy, sinon.match.has('err', undefined))
          })

          it('calls the "abc" function', function () {
            sinon.assert.calledWith(spy, sinon.match.has('route', 'abc'))
          })

          it('calls function only once', function () {
            sinon.assert.calledOnce(spy)
          })

          it('has "123" as content', function () {
            sinon.assert.calledWith(spy, sinon.match.has('content', '123'))
          })

          it('output user input matches passed in string', function () {
            sinon.assert.calledWith(spy, sinon.match.has('userInput', 'abc 123'))
          })
        })

        describe('"ABC"', function () {
          before(function () {
            return router.route('abc123')
          })

          after(function () {
            spy.resetHistory()
          })

          it('has not errored', function () {
            sinon.assert.calledWith(spy, sinon.match.has('err', undefined))
          })

          it('calls the "abc" function', function () {
            sinon.assert.calledWith(spy, sinon.match.has('route', 'abc'))
          })
        })
      })

      describe('def command', function () {
        describe('"def"', function () {
          before(function () {
            return router.route('def')
          })

          after(function () {
            spy.resetHistory()
          })

          it('has not errored', function () {
            sinon.assert.calledWith(spy, sinon.match.has('err', undefined))
          })

          it('calls the "def" function', function () {
            sinon.assert.calledWith(spy, sinon.match.has('route', 'def'))
          })

          it('calls function only once', function () {
            sinon.assert.calledOnce(spy)
          })

          it('output user input matches passed in string', function () {
            sinon.assert.calledWith(spy, sinon.match.has('userInput', 'def'))
          })
        })
      })
    })

    describe('prefix routing', function () {
      const router = new HaSeul();

      let spy = sinon.spy();

      router
        .set('prefix', ['haseul', 'vivi'])
        .command('bot', (args) => { spy(args); args.done() })
        .command('help', (args) => { spy(args); args.done() })


      describe('"haseulbot"', function () {
        before(function () {
          return router.route('haseulbot')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "bot" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'bot'))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })

        it('uses the "haseul" prefix', function () {
          sinon.assert.calledWith(spy, sinon.match.has('prefix', 'haseul'))
        })
      })

      describe('"vivibot"', function () {
        before(function () {
          return router.route('vivibot')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "bot" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'bot'))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })

        it('uses the "vivi" prefix', function () {
          sinon.assert.calledWith(spy, sinon.match.has('prefix', 'vivi'))
        })
      })

      describe('"  haseul bot  "', function () {
        before(function () {
          return router.route('  haseul bot  ')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "bot" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'bot'))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })
      })

      describe('"  haseul bot   framework   "', function () {
        before(function () {
          return router.route('  haseul bot   framework   ')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "bot" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'bot'))
        })

        it('has content of "framework"', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', 'framework'))
        })
      })
    })
    describe('nested routing', function () {
      const router = new HaSeul();
      const deeperRouter = new HaSeul();

      let spy = sinon.spy();

      router
        .set('prefix', ['haseul', 'yeojin'])
        .command('second', deeperRouter)

      deeperRouter
        .command('bot', (args) => { spy(args); args.done() })
        .command('vivi', (args) => { spy(args); args.done() })
        .command((args) => { spy(args); args.done() })

      describe('"yeojinsecond"', function () {
        before(function () {
          return router.route('yeojinsecond')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the default function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', null))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })
      })

      describe('"yeojinsecondbot"', function () {
        before(function () {
          return router.route('yeojinsecondbot')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "bot" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'bot'))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })
      })

      describe('"yeojinsecondvivi"', function () {
        before(function () {
          return router.route('yeojinsecondvivi')
        })

        after(function () {
          spy.resetHistory()
        })

        it('calls the "vivi" function', function () {
          sinon.assert.calledWith(spy, sinon.match.has('route', 'vivi'))
        })

        it('has content of empty string', function () {
          sinon.assert.calledWith(spy, sinon.match.has('content', ''))
        })
      })
    })
  })
})
