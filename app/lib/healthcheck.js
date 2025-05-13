const express = require('express')
const router = express.Router()
const xml = require('xml')
const logger = require('../logger')

router.get('/pingdom/ping.xml', (req, res) => {
  const start = process.hrtime()

  const healthStatus = {
    app: { success: true }
  }

  const isHealthy = Object.values(healthStatus).every((check) => check.success)
  const status = isHealthy ? 'OK' : 'FAIL'

  let responseTime = '0.000'

  try {
    const diff = process.hrtime(start)
    if (diff && typeof diff[0] === 'number' && typeof diff[1] === 'number') {
      responseTime = (diff[0] + diff[1] / 1e9).toFixed(3)
    } else {
      throw new Error('Invalid hrtime result')
    }
  } catch (error) {
    logger.error(`Error calculating response time: ${error.message}`, {
      eventType: 'HealthcheckError'
    })
  }

  const response = xml(
    [
      {
        pingdom_http_custom_check: [
          { status },
          { response_time: responseTime }
        ]
      }
    ],
    {
      declaration: true
    }
  )

  if (process.env !== 'production') {
    logger.info(
      `Healthcheck status: ${status}, response_time: ${responseTime}s`,
      {
        eventType: 'ApplicationEvent'
      }
    )
  }

  res.type('application/xml')
  res.status(isHealthy ? 200 : 500).send(response)
})

module.exports = router
