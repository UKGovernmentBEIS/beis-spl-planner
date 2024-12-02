const supertest = require('supertest')
const { describe, it, beforeEach } = require('mocha')
const proxyrequire = require('proxyquire')
const sinon = require('sinon')

const getApp = require('../../../server').getApp
const paths = require('../../../app/paths')

describe('router', () => {
  describe('GET /', () => {
    it('returns 302 status and redirects to the first question page', (done) => {
      supertest(getApp())
        .get(paths.getPath('root'))
        .expect(302)
        .expect('Location', paths.getPath('natureOfParenthood'))
        .end(done)
    })
  })

  describe('feedback', () => {
    describe('GET /feedback', () => {
      it('/feedback should return 200 status', (done) => {
        supertest(getApp())
          .get(paths.getPath('feedback'))
          .expect(200)
          .end(done)
      })
    })

    describe('POST /feedback', () => {
      beforeEach(() => {
        const emailjsSendStub = sinon
          .stub()
          .resolves({ status: 200, text: 'OK' })

        proxyrequire('../../../app/emailjs-mailer', {
          '@emailjs/nodejs': {
            send: emailjsSendStub
          }
        })
      })
      it('/feedback should return 302 status', (done) => {
        supertest(getApp())
          .post(paths.getPath('feedback'))
          .send({
            feedback: 'Great service!',
            'feedback-more-detail': 'No additional feedback',
            userAgent: 'test-agent',
            'spam-filter': 'yes'
          })
          .expect(302)
          .end(done)
      })

      it('should be redirected back to /feedback if url honeypot field is entered', (done) => {
        supertest(getApp())
          .post(paths.getPath('feedback'))
          .send({
            url: 'www.test-bot.com',
            feedback: 'Great service!',
            'feedback-more-detail': 'No additional feedback',
            userAgent: 'test-agent',
            'spam-filter': 'yes'
          })
          .expect(302)
          .end(done)
      })
    })
  })
})
