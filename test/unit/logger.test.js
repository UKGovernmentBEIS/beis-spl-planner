const { describe, xit, it, beforeEach, afterEach } = require('mocha')
const stdMocks = require('std-mocks')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const logger = require('../../app/logger')

describe('Logger transport check', () => {
  afterEach(() => {
    sinon.restore()
    stdMocks.restore()
  })

  describe('In production environment', () => {
    xit('should log info in JSON format', () => {})
    xit('should log error in JSON format', () => {})
  })

  describe('In non-production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should log info in plain text format', () => {
      stdMocks.use()

      logger.info('Plain log info')

      stdMocks.restore()
      const output = stdMocks.flush()

      expect(output.stdout[0]).to.contain('Plain log info')
    })

    it('should log error in plain text format', () => {
      stdMocks.use()

      logger.error('Plain log error')

      stdMocks.restore()
      const output = stdMocks.flush()

      expect(output.stdout[0]).to.contain('Plain log error')
    })
  })
})
