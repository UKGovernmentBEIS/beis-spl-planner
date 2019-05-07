const supertest = require('supertest')
const { describe, it } = require('mocha')

const getApp = require('../server').getApp

describe('GET /', () => {
  it('should return 200 status', done => {
    supertest(getApp())
      .get('/')
      .expect(200)
      .end(done)
  })
})
