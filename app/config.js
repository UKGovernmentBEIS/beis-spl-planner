const { NODE_ENV, LOG_LEVEL } = process.env

const config = {
  isProd: NODE_ENV === 'production',
  isDev: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
  logLevel: LOG_LEVEL || 'info'
}

module.exports = config
