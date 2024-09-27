const { describe, it, beforeEach, afterEach } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const paths = require('../../../../app/paths')
const ShareTokenDecoder = require('../../../../app/lib/shareToken/shareTokenDecoder')
const sessionData = require('../../../../common/utils/session-data')

describe('sessionData', function () {
  let req, res, next, tokenDecoderStub

  beforeEach(function () {
    req = {
      method: 'GET',
      url: '/some-path',
      query: {},
      session: { data: {} },
      headers: {
        host: 'localhost:3000'
      }
    }

    res = {
      redirect: sinon.spy(),
      locals: {}
    }

    next = sinon.spy()

    tokenDecoderStub = sinon.stub(ShareTokenDecoder.prototype, 'decode')
  })

  afterEach(function () {
    tokenDecoderStub.restore()
  })

  describe('GET and data-in-query', function () {
    it('should handle GET request with data-in-query', function () {
      req.query['data-in-query'] = 'true'
      req.url = '/some-path?primary%5Bleave%5D=0%2C1&secondary%5Bleave%5D=2'

      sessionData(req, res, next)

      expect(req.session.data).to.deep.equal({
        '?primary': { leave: '0,1' },
        secondary: { leave: '2' }
      })
    })

    it('should redirect to the same path after handling GET request with data-in-query', function () {
      req.query['data-in-query'] = 'true'
      req.url = '/some-path?primary%5Bleave%5D=0%2C1&secondary%5Bleave%5D=2'

      sessionData(req, res, next)

      expect(res.redirect.called).to.equal(true)
    })

    it('should not call next for GET request with data-in-query', function () {
      req.query['data-in-query'] = 'true'
      req.url = '/some-path?primary%5Bleave%5D=0%2C1&secondary%5Bleave%5D=2'

      sessionData(req, res, next)

      expect(next.called).to.equal(false)
    })
  })

  describe('s1 query', function () {
    beforeEach(function () {
      tokenDecoderStub.returns({ key: 'decodedValue' })
    })

    it('should handle GET request with s1 token', function () {
      req.query.s1 = 'someToken'

      sessionData(req, res, next)

      expect(tokenDecoderStub.called).to.equal(true)
    })

    it('should store decoded token value in session data', function () {
      req.query.s1 = 'someToken'

      sessionData(req, res, next)

      expect(req.session.data).to.deep.equal({ key: 'decodedValue' })
    })

    it('should redirect to the same path after handling GET request with s1 token', function () {
      req.query.s1 = 'someToken'

      sessionData(req, res, next)

      expect(res.redirect.called).to.equal(true)
    })
  })

  describe('POST requests', function () {
    it('should call next for POST request and store body in session', function () {
      req.method = 'POST'
      req.body = { key: 'value' }

      sessionData(req, res, next)

      expect(next.calledOnce).to.equal(true)
    })

    it('should store body in session for POST request', function () {
      req.method = 'POST'
      req.body = { key: 'value' }

      sessionData(req, res, next)

      expect(req.session.data).to.deep.contain({ key: 'value' })
    })
  })

  describe('backPathForHelpPages', function () {
    it('should initialize empty session data if not present', function () {
      req.session.data = undefined

      sessionData(req, res, next)

      expect(req.session.data).to.deep.equal({
        backPathForHelpPages: undefined
      })
    })

    it('should call next if session data is initialized', function () {
      req.session.data = undefined

      sessionData(req, res, next)

      expect(next.calledOnce).to.equal(true)
    })

    it('should update backPathForHelpPages if it is a workflow page', function () {
      req.path = '/some-path'
      sinon.stub(paths, 'isWorkFlowPage').returns(true)

      sessionData(req, res, next)

      expect(req.session.data.backPathForHelpPages).to.equal('/some-path')

      paths.isWorkFlowPage.restore()
    })

    it('should call next if it is a workflow page', function () {
      req.path = '/some-path'
      sinon.stub(paths, 'isWorkFlowPage').returns(true)

      sessionData(req, res, next)

      expect(next.calledOnce).to.equal(true)

      paths.isWorkFlowPage.restore()
    })

    it('should not update backPathForHelpPages if not a workflow page', function () {
      req.path = '/some-other-path'
      req.session.data.backPathForHelpPages = '/existing-path'
      sinon.stub(paths, 'isWorkFlowPage').returns(false)

      sessionData(req, res, next)

      expect(req.session.data.backPathForHelpPages).to.equal('/existing-path')

      paths.isWorkFlowPage.restore()
    })

    it('should call next if not a workflow page', function () {
      req.path = '/some-other-path'
      req.session.data.backPathForHelpPages = '/existing-path'
      sinon.stub(paths, 'isWorkFlowPage').returns(false)

      sessionData(req, res, next)

      expect(next.calledOnce).to.equal(true)

      paths.isWorkFlowPage.restore()
    })
  })

  describe('withData', function () {
    it('should correctly generate withData URL in res.locals', function () {
      req.session.data = { key: 'value' }

      sessionData(req, res, next)

      const withDataUrl = res.locals.withData('/test-path')
      expect(withDataUrl).to.equal('/test-path?data-in-query=true&key=value')
    })
  })

  describe('backPath', function () {
    it('should correctly generate backPath in res.locals', function () {
      const getPreviousWorkflowPathStub = sinon
        .stub(paths, 'getPreviousWorkflowPath')
        .returns('/mocked-path')

      req.session.data = { key: 'value' }
      req.path = '/current-path'

      sessionData(req, res, next)

      const backPath = res.locals.backPath()
      expect(backPath).to.equal('/mocked-path?data-in-query=true&key=value')

      getPreviousWorkflowPathStub.restore()
    })
  })
})
