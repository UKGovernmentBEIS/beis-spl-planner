'use strict'

const path = require('path')
const fs = require('fs')
const logger = require('./app/logger')
const throng = require('throng')
const server = require('./server')
const { NODE_ENV } = process.env

const pidFile = path.join(__dirname, '/.start.pid')
const fileOptions = { encoding: 'utf-8' }
let pid

/**
 * Throng is a wrapper around node cluster
 * https://github.com/hunterloftis/throng
 */
function start () {
  throng({
    workers: process.env.NODE_WORKER_COUNT || 1,
    master: startMaster,
    start: startWorker
  })
}

/**
 * Start master process
 */
function startMaster () {
  logger.info({
    message: `Starting in NODE_ENV ${NODE_ENV}`,
    eventType: 'MasterProcessStart',
    eventResult: 'Success',
    processId: process.pid
  })

  logger.info({
    message: `Master process started. PID: ${process.pid}`,
    eventType: 'MasterProcessStart',
    eventResult: 'Success',
    processId: process.pid
  })

  process.on('SIGINT', () => {
    logger.info({
      message: 'Master process exiting due to SIGINT',
      eventType: 'ProcessShutdown',
      eventResult: 'GracefulExit',
      processId: process.pid
    })
    process.exit()
  })
}

/**
 * Start cluster worker. Log start and exit
 * @param  {Number} workerId
 */
function startWorker (workerId) {
  server.start()

  logger.info({
    message: `Worker process started. Worker ID: ${workerId}, PID: ${process.pid}`,
    eventType: 'WorkerProcessStart',
    eventResult: 'Success',
    workerId,
    processId: process.pid
  })

  process.on('SIGINT', () => {
    logger.info({
      message: `Worker ${workerId} exiting due to SIGINT...`,
      eventType: 'ProcessShutdown',
      eventResult: 'GracefulExit',
      workerId,
      processId: process.pid
    })
    process.exit()
  })
}

/**
 * Make sure all child processes are cleaned up
 */
function onInterrupt () {
  try {
    pid = fs.readFileSync(pidFile, fileOptions)
    fs.unlink(pidFile, (err) => {
      if (err) {
        logger.error({
          message: `Failed to delete PID file: ${err.message}`,
          eventType: 'FileError',
          eventResult: 'Failure',
          errorDetails: err.message
        })
        throw err
      }
      logger.info({
        message: 'PID file successfully deleted.',
        eventType: 'ProcessMonitoring',
        eventResult: 'Success'
      })
    })
    process.kill(pid, 'SIGTERM')
  } catch (error) {
    logger.error({
      message: `Failed to handle interrupt: ${error.message}`,
      eventType: 'ProcessError',
      eventResult: 'Failure',
      errorDetails: error.message
    })
  } finally {
    process.exit()
  }
}

/**
 * Keep track of processes, and clean up on SIGINT
 */
function monitor () {
  fs.writeFileSync(pidFile, `${process.pid}`, fileOptions)
  logger.info({
    message: `Monitoring process started. PID: ${process.pid}`,
    eventType: 'ProcessMonitoring',
    eventResult: 'Success',
    processId: process.pid
  })
  process.on('SIGINT', onInterrupt)
}
monitor()

start()
