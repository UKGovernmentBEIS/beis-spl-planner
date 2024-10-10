const { describe, it, beforeEach } = require('mocha')
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const cookieManagerStub = {
  init: sinon.stub()
}

const additionalScriptMock = sinon.stub()

const proxyquire = require('proxyquire').noCallThru()
// eslint-disable-next-line no-unused-vars
const browsered = proxyquire('../../../../common/browsered/index.js', {
  '../../../../node_modules/@dvsa/cookie-manager/cookie-manager.js':
    cookieManagerStub,
  '../../app/assets/javascripts/index': additionalScriptMock
})

describe('browsered', () => {
  beforeEach(() => {
    cookieManagerStub.init.reset()
    additionalScriptMock.reset()
  })

  it('cookieManager is defined', () => {
    expect(cookieManagerStub).to.be.an('object')
    expect(cookieManagerStub).to.have.property('init')
    expect(cookieManagerStub.init).to.be.a('function')
  })
})
