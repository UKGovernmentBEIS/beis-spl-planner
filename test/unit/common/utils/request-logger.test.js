const { describe, it, beforeEach, afterEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const logger = require('../../../../app/logger')
const requestLogger = require('../../../../common/utils/request-logger')

describe('request-logger', function () {
  let context, response, error

  beforeEach(() => {
    sinon.stub(logger, 'debug')
    sinon.stub(logger, 'info')
    sinon.stub(logger, 'error')

    context = {
      service: 'TestService',
      description: 'Test description',
      method: 'GET',
      url: '/test',
      correlationId: '1234',
      startTime: new Date()
    }

    response = { statusCode: 500, body: 'Error body' }
    error = new Error('Test error')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should log request start correctly', function () {
    requestLogger.logRequestStart(context)

    expect(logger.debug.calledOnce).to.equal(true)
    expect(logger.debug.firstCall.args[0]).to.include({
      message: `Calling ${context.service} ${context.description}`,
      eventType: 'RequestStart',
      eventSeverity: 'Informational',
      service: context.service,
      method: context.method,
      url: context.url,
      correlationId: context.correlationId
    })
  })

  it('should log request end correctly', function () {
    context.startTime = new Date(new Date().getTime() - 100) // 100ms ago

    requestLogger.logRequestEnd(context)

    expect(logger.info.calledOnce).to.equal(true)

    expect(logger.info.firstCall.args[0].message).to.match(
      new RegExp(
        `\\[${context.correlationId}\\] - ${context.method} to ${context.url} ended - elapsed time: \\d+ ms`
      )
    )

    expect(logger.info.firstCall.args[0]).to.include({
      eventType: 'RequestEnd',
      eventSeverity: 'Informational',
      service: context.service,
      method: context.method,
      url: context.url,
      correlationId: context.correlationId
    })

    expect(logger.info.firstCall.args[0].duration).to.match(/\d+ ms/)
  })

  it('should log request failure correctly', function () {
    requestLogger.logRequestFailure(context, response)

    expect(logger.error.calledOnce).to.equal(true)
    expect(logger.error.firstCall.args[0]).to.include({
      message: `[${context.correlationId}] Calling ${context.service} to ${context.description} failed`,
      eventType: 'RequestFailure',
      eventSeverity: 'Medium',
      service: context.service,
      method: context.method,
      url: context.url,
      statusCode: response.statusCode,
      correlationId: context.correlationId
    })
    expect(logger.error.firstCall.args[0].additionalInfo).to.deep.include({
      description: context.description,
      responseBody: response.body
    })
  })

  it('should log request error correctly', function () {
    requestLogger.logRequestError(context, error)

    expect(logger.error.calledOnce).to.equal(true)
    expect(logger.error.firstCall.args[0]).to.include({
      message: `[${context.correlationId}] Calling ${context.service} to ${context.description} threw exception`,
      eventType: 'RequestError',
      eventSeverity: 'High',
      service: context.service,
      method: context.method,
      url: context.url,
      error: error.message,
      correlationId: context.correlationId,
      stackTrace: error.stack
    })
    expect(logger.error.firstCall.args[0].additionalInfo).to.deep.include({
      description: context.description
    })
  })
})
