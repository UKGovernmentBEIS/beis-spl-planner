const { describe, it, beforeEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const errorHandler = require('../../../../common/middleware/handle-500')

describe('handle-500 middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: sinon.stub().returnsThis(),
      render: sinon.spy(),
      headersSent: false
    }
    next = sinon.spy()
  })

  it('should set the status to 500 and render the 500 error page when headers are not sent', () => {
    const error = new Error('Test error')

    errorHandler(error, req, res, next)

    expect(res.status.calledOnceWith(500)).to.equal(true)

    expect(res.render.calledOnceWith('error-pages/500-page')).to.equal(true)

    expect(next.called).to.equal(false)
  })

  it('should call next(err) when headers have already been sent', () => {
    const error = new Error('Test error')
    res.headersSent = true

    errorHandler(error, req, res, next)

    expect(next.calledOnceWith(error)).to.equal(true)

    expect(res.status.called).to.equal(false)
    expect(res.render.called).to.equal(false)
  })
})
