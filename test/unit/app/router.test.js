const supertest = require('supertest')
const { describe, it } = require('mocha')

const getApp = require('../../../server').getApp
const paths = require('../../../app/paths')

describe('GET /', () => {
  it('returns 302 status and redirects to the first question page', (done) => {
    supertest(getApp())
      .get(paths.getPath('root'))
      .expect(302)
      .expect('Location', paths.getPath('natureOfParenthood'))
      .end(done)
  })
})
