const { describe, it } = require('mocha')
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const noCache = require('../../../../common/utils/no-cache')

describe('no-cache utility', function () {
  it('should set the correct cache-control headers', function () {
    const res = {
      header: sinon.spy()
    }

    noCache(res)

    expect(
      res.header.calledWith(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate'
      )
    ).to.equal(true)
    expect(res.header.calledWith('Expires', '-1')).to.equal(true)
    expect(res.header.calledWith('Pragma', 'no-cache')).to.equal(true)

    expect(res.header.callCount).to.equal(3)
  })
})
