const { xdescribe, describe, it, beforeEach, afterEach } = require('mocha')
const stdMocks = require('std-mocks')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect

const expectedInfo = {
  EventMessage: 'Message for info',
  EventCount: 1,
  EventType: 'ApplicationEvent',
  EventResult: 'NA',
  EventSeverity: 'Informational',
  EventOriginalSeverity: 'info',
  EventSchema: 'ProcessEvent',
  EventSchemaVersion: '0.1.4',
  ActingAppType: 'Express',
  AdditionalFields: { CustomASIMFormatter: true, TraceHeaders: {} }
}

const expectedError = {
  EventMessage: 'Message for error',
  EventCount: 1,
  EventType: 'ApplicationEvent',
  EventResult: 'NA',
  EventSeverity: 'Medium',
  EventOriginalSeverity: 'error',
  EventSchema: 'ProcessEvent',
  EventSchemaVersion: '0.1.4',
  ActingAppType: 'Express',
  AdditionalFields: { CustomASIMFormatter: true, TraceHeaders: {} }
}

describe('Logger transport check', () => {
  let logger

  afterEach(() => {
    sinon.restore()
    stdMocks.restore()
  })

  // tests pass when running separately but fail on CI and with the whole test suite, due to env setting
  xdescribe('In production environment', () => {
    beforeEach(() => {
      stdMocks.use()
      process.env.NODE_ENV = 'production'
      logger = require('../test-app')
    })

    it('should log info in JSON format', function () {
      if (process.env.CI) {
        stdMocks.restore()
        this.skip()
      }
      logger.info('Message for info', { eventType: 'ApplicationEvent' })

      stdMocks.restore()
      const output = stdMocks.flush()

      const logEntry = JSON.parse(output.stdout[0])

      expect(logEntry).to.deep.include(expectedInfo)
    })
    it('should log error in JSON format', function () {
      if (process.env.CI) {
        stdMocks.restore()
        this.skip()
      }
      logger.error('Message for error', { eventType: 'ApplicationEvent' })

      stdMocks.restore()
      const output = stdMocks.flush()

      const logEntry = JSON.parse(output.stdout[0])

      expect(logEntry).to.deep.include(expectedError)
    })
  })

  describe('In non-production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      logger = require('../test-app')
      stdMocks.use()
    })

    it('should log info in plain text format', () => {
      logger.info('Plain log info')

      stdMocks.restore()
      const output = stdMocks.flush()

      expect(output.stdout[0]).to.contain('Plain log info')
    })

    it('should log error in plain text format', () => {
      logger.error('Plain log error')

      stdMocks.restore()
      const output = stdMocks.flush()

      expect(output.stdout[0]).to.contain('Plain log error')
    })
  })
})
