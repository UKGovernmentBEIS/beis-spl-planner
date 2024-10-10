const { describe, it, beforeEach, afterEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const stepValidation = require('../../../../common/middleware/step-validation')
const paths = require('../../../../app/paths')

describe('step-validation middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      path: '/current-path',
      session: {
        data: {}
      }
    }
    res = {
      redirect: sinon.spy()
    }
    next = sinon.spy()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should redirect to the earliest path with validation errors', () => {
    sinon.stub(paths, 'getPreviousWorkflowPath').returns('/previous-path')
    sinon.stub(paths, 'getValidator').returns(() => false)

    stepValidation(req, res, next)

    expect(res.redirect.calledOnceWith('/previous-path')).to.equal(true)
    expect(next.called).to.equal(false)
  })

  it('should call next() when there are no validation errors', () => {
    sinon.stub(paths, 'getPreviousWorkflowPath').returns(null)
    sinon.stub(paths, 'getValidator').returns(() => true)

    stepValidation(req, res, next)

    expect(next.calledOnce).to.equal(true)
    expect(res.redirect.called).to.equal(false)
  })

  it('should call next() when redirect is disabled', () => {
    sinon.stub(paths, 'getPreviousWorkflowPath').returns('/previous-path')
    sinon.stub(paths, 'getValidator').returns(() => false)

    process.env.NODE_ENV = 'development'
    process.env.PA11Y_TEST = 'true'

    stepValidation(req, res, next)

    expect(next.calledOnce).to.equal(true)
    expect(res.redirect.called).to.equal(false)

    delete process.env.NODE_ENV
    delete process.env.PA11Y_TEST
  })
})
