const { describe, it, beforeEach } = require('mocha')
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const correlationHeaderMiddleware = require('../../../../common/middleware/correlation-header')
const config = require('../../../../common/config/index')

describe('correlation-header middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { headers: {} }
    res = {}
    next = sinon.spy()
  })

  it('should extract the correlation ID from headers and assign it to req.correlationId', () => {
    req.headers[config.CORRELATION_HEADER] = '12345abc'

    correlationHeaderMiddleware(req, res, next)

    expect(req.correlationId).to.equal('12345abc')

    expect(next.calledOnce).to.equal(true)
  })

  it('should set req.correlationId to an empty string if the header is not present', () => {
    correlationHeaderMiddleware(req, res, next)

    expect(req.correlationId).to.equal('')

    expect(next.calledOnce).to.equal(true)
  })

  it('should use the default header x-request-id if CORRELATION_HEADER is not set in config', () => {
    const originalHeader = config.CORRELATION_HEADER
    config.CORRELATION_HEADER = 'x-request-id'

    req.headers['x-request-id'] = 'abc123'

    correlationHeaderMiddleware(req, res, next)

    expect(req.correlationId).to.equal('abc123')

    expect(next.calledOnce).to.equal(true)

    config.CORRELATION_HEADER = originalHeader
  })
})
