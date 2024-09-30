const logger = require('../../app/logger')

module.exports = {
  logRequestStart: context => {
    logger.debug({
      message: `Calling ${context.service} ${context.description}`,
      eventType: 'RequestStart',
      eventSeverity: 'Informational',
      service: context.service,
      method: context.method,
      url: context.url,
      correlationId: context.correlationId,
      additionalInfo: {
        description: context.description
      }
    })
  },

  logRequestEnd: context => {
    const duration = new Date() - context.startTime
    logger.info({
      message: `[${context.correlationId}] - ${context.method} to ${context.url} ended - elapsed time: ${duration} ms`,
      eventType: 'RequestEnd',
      eventSeverity: 'Informational',
      service: context.service,
      method: context.method,
      url: context.url,
      duration: `${duration} ms`,
      correlationId: context.correlationId
    })
  },

  logRequestFailure: (context, response) => {
    logger.error({
      message: `[${context.correlationId}] Calling ${context.service} to ${context.description} failed`,
      eventType: 'RequestFailure',
      eventSeverity: 'Medium',
      service: context.service,
      method: context.method,
      url: context.url,
      statusCode: response.statusCode,
      correlationId: context.correlationId,
      additionalInfo: {
        description: context.description,
        responseBody: response.body
      }
    })
  },

  logRequestError: (context, error) => {
    logger.error({
      message: `[${context.correlationId}] Calling ${context.service} to ${context.description} threw exception`,
      eventType: 'RequestError',
      eventSeverity: 'High',
      service: context.service,
      method: context.method,
      url: context.url,
      error: error.message,
      correlationId: context.correlationId,
      stackTrace: error.stack,
      additionalInfo: {
        description: context.description
      }
    })
  }
}
