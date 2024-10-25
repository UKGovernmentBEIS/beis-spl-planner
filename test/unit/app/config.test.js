const { describe, it, afterEach } = require('mocha')
const { expect } = require('chai')

describe('config.js', () => {
  let config

  const loadConfig = () => {
    delete require.cache[require.resolve('../../../app/config')]
    return require('../../../app/config')
  }

  const expectEnvConfig = (env, isProd, isDev, isTest) => {
    process.env.NODE_ENV = env
    config = loadConfig()
    expect(config.isProd).to.equal(isProd)
    expect(config.isDev).to.equal(isDev)
    expect(config.isTest).to.equal(isTest)
  }

  afterEach(() => {
    delete process.env.NODE_ENV
    delete process.env.LOG_LEVEL
  })

  it('should set isProd to true when NODE_ENV is production', function () {
    expectEnvConfig('production', true, false, false)
  })

  it('should set isDev to true when NODE_ENV is development', function () {
    expectEnvConfig('development', false, true, false)
  })

  it('should set isTest to true when NODE_ENV is test', function () {
    expectEnvConfig('test', false, false, true)
  })

  it('should set logLevel to the LOG_LEVEL environment variable if defined', function () {
    process.env.LOG_LEVEL = 'debug'
    config = loadConfig()
    expect(config.logLevel).to.equal('debug')
  })

  it('should default logLevel to info if LOG_LEVEL is not defined', function () {
    delete process.env.LOG_LEVEL
    config = loadConfig()
    expect(config.logLevel).to.equal('info')
  })
})
