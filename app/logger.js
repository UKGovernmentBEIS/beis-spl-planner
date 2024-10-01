const winston = require('winston')
const { NODE_ENV, LOG_LEVEL } = process.env

const { createLogger, transports, format } = winston

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const asimFormat = format.printf(({ level, message, timestamp, eventType }) => {
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
})

const getEventSeverity = (level) => {
  return {
    debug: 'Informational',
    info: 'Informational',
    warn: 'Low',
    error: 'Medium',
    critical: 'High'
  }[level]
}

const formatOptions = () => {
  if (NODE_ENV === 'production') {
    return format.combine(
      format.timestamp(),
      asimFormat
    )
  } else {
    return format.combine(
      format.colorize({ all: true }),
      format.simple()
    )
  }
}

const loggerConfiguration = {
  level: LOG_LEVEL || 'info',
  exitOnError: true,
  transports: [
    new transports.Console({
      handleExceptions: true,
      humanReadableUnhandledException: true,
      format: formatOptions()
    })
  ]
}

if (NODE_ENV === 'production') {
  loggerConfiguration.transports[0].json = true
}

const logger = createLogger(loggerConfiguration)

if (NODE_ENV === 'production') {
  logger.exceptions.handle(
    new transports.Console({
      format: format.combine(format.timestamp(), format.json())
    })
  )
}

module.exports = logger
