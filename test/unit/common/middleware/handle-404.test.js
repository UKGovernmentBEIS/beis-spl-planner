const { describe, it, beforeEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const handle404 = require('../../../../common/middleware/handle-404')

describe('handle-404 middleware', () => {
  let req, res

  beforeEach(() => {
    req = {}
    res = {
      status: sinon.stub().returnsThis(),
      render: sinon.spy()
    }
  })

  it('should set the status to 404 and render the 404 error page', () => {
    handle404(req, res)

    expect(res.status.calledOnceWith(404)).to.equal(true)

    expect(res.render.calledOnceWith('error-pages/404-page')).to.equal(true)
  })
})
