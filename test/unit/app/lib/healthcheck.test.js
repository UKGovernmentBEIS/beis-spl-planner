const express = require('express')
const request = require('supertest')
const { expect } = require('chai')
const { describe, it } = require('mocha')
const healthcheckRouter = require('../../../../app/lib/healthcheck')

const app = express()
app.use(healthcheckRouter)

describe('Health Check Endpoint', () => {
  describe('When the service is healthy', () => {
    it('should return a 200 status code', async () => {
      const response = await request(app).get('/pingdom/ping.xml')
      expect(response.status).to.equal(200)
    })

    it('should return XML with <status>OK</status> and <response_time>', async () => {
      const response = await request(app).get('/pingdom/ping.xml')
      expect(response.type).to.equal('application/xml')

      const xml = response.text.trim()

      expect(xml).to.include('<status>OK</status>')
      expect(xml).to.match(/<response_time>.*<\/response_time>/)
    })
  })
})
