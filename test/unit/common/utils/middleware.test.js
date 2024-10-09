const { beforeEach, afterEach, describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const { excludingPaths } = require('../../../../common/utils/middleware')

describe('middleware', function () {
  describe('excludingPaths', function () {
    let middlewareStub
    let req
    let res
    let next

    beforeEach(function () {
      middlewareStub = sinon.stub()
      req = { url: '' }
      res = {}
      next = sinon.spy()
    })

    afterEach(function () {
      sinon.restore()
    })

    it('excludes paths for given middleware', function () {
      const excludedPaths = ['/login', '/signup']
      const middleware = middlewareStub

      const middlewareFunction = excludingPaths(excludedPaths, middleware)

      req.url = '/login'

      middlewareFunction(req, res, next)

      expect(middleware.called).to.equal(false)

      expect(next.calledOnce).to.equal(true)
    })

    it('applies middleware when path is not excluded', function () {
      const excludedPaths = ['/login', '/signup']
      const middleware = middlewareStub

      const middlewareFunction = excludingPaths(excludedPaths, middleware)

      req.url = '/dashboard'

      middlewareFunction(req, res, next)

      expect(middleware.calledOnce).to.equal(true)
      expect(middleware.calledWith(req, res, next)).to.equal(true)

      expect(next.called).to.equal(false)
    })

    it('applies middleware when paths array is empty', function () {
      const excludedPaths = []
      const middleware = middlewareStub

      const middlewareFunction = excludingPaths(excludedPaths, middleware)

      req.url = '/anypath'

      middlewareFunction(req, res, next)

      expect(middleware.calledOnce).to.equal(true)
      expect(middleware.calledWith(req, res, next)).to.equal(true)

      expect(next.called).to.equal(false)
    })

    it('handles multiple excluded paths correctly', function () {
      const excludedPaths = ['/home', '/about', '/contact']
      const middleware = middlewareStub

      const middlewareFunction = excludingPaths(excludedPaths, middleware);

      ['/home', '/about', '/contact'].forEach((path) => {
        middleware.resetHistory()
        next.resetHistory()

        req.url = path
        middlewareFunction(req, res, next)

        expect(middleware.called).to.equal(false)
        expect(next.calledOnce).to.equal(true)
      });

      ['/dashboard', '/profile', '/settings'].forEach((path) => {
        middleware.resetHistory()
        next.resetHistory()

        req.url = path
        middlewareFunction(req, res, next)

        expect(middleware.calledOnce).to.equal(true)
        expect(middleware.calledWith(req, res, next)).to.equal(true)
        expect(next.called).to.equal(false)
      })
    })

    it('does not apply middleware if req.url has query parameters but matches an excluded path', function () {
      const excludedPaths = ['/login', '/signup']
      const middleware = middlewareStub

      const middlewareFunction = excludingPaths(excludedPaths, middleware)

      req.url = '/login?redirect=/dashboard'

      middlewareFunction(req, res, next)

      expect(middleware.calledOnce).to.equal(true)
      expect(middleware.calledWith(req, res, next)).to.equal(true)
      expect(next.called).to.equal(false)
    })

    it('uses req.path instead of req.url for matching if implemented', function () {
      const excludedPaths = ['/login', '/signup']
      const middleware = middlewareStub

      const excludingPathsWithPath = function (paths, middleware) {
        return function (req, res, next) {
          if (paths.indexOf(req.path) >= 0) {
            next()
          } else {
            return middleware(req, res, next)
          }
        }
      }

      const middlewareFunction = excludingPathsWithPath(
        excludedPaths,
        middleware
      )

      req.url = '/login?redirect=/dashboard'
      req.path = '/login'

      middlewareFunction(req, res, next)

      expect(middleware.called).to.equal(false)
      expect(next.calledOnce).to.equal(true)
    })
  })
})
