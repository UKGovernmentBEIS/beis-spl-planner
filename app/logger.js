const winston = require('winston')

const { createLogger, transports, format } = winston

const asimFormat = format.printf(
  ({ level, message, timestamp, eventType }) => {
    return JSON.stringify({
      EventMessage: message,
      EventCount: 1,
      EventStartTime: timestamp,
      EventEndTime: timestamp,
      EventType: eventType,
      EventResult: 'NA',
      EventSeverity: getEventSeverity(level),
      EventOriginalSeverity: level,
      EventSchema: 'ProcessEvent',
      EventSchemaVersion: '0.1.4',
      ActingAppType: 'Express',
      AdditionalFields: {
        CustomASIMFormatter: true,
        TraceHeaders: {}
      }
    })
  }
)

const getEventSeverity = (level) => {
  return {
    debug: 'Informational',
    info: 'Informational',
    warn: 'Low',
    error: 'Medium',
    critical: 'High'
  }[level]
}

const loggerConfiguration = {
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: true,
  transports: [
    new transports.Console({
      handleExceptions: true,
      humanReadableUnhandledException: true,
      format: format.combine(
        format.colorize({ all: true }),
        winston.format.splat(),
        format.simple()
      )
    })
  ]
}

if (process.env === 'production') {
  loggerConfiguration.transports = [
    new transports.Console({
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: true,
      format: format.combine(
        winston.format.splat(),
        format.simple(),
        format.timestamp(),
        asimFormat
      )
    })
  ]
}

const logger = createLogger(loggerConfiguration)
if (process.env === 'production') {
  logger.exceptions.handle(
    new transports.Console({
      format: format.combine(format.timestamp(), format.json())
    })
  )
}

module.exports = logger
