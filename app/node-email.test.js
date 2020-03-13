const { describe, it } = require('mocha')
const assert = require('chai').assert

const nodemailer = require('nodemailer')

describe('Node Mailer', () => {
  it('should send an email', async () => {
    const stubMailer = nodemailer.createTransport({
      service: 'Stub',
      auth: {
        user: 'test@test.com',
        pass: 'test123'
      }
    })

    await stubMailer.sendMail({
      from: 'test@test.com',
      to: 'test2@test.com',
      subject: 'Test',
      text: 'Test'
    }, results => {
      console.log(results)
      assert.notEqual(results.messageId, null)
    })
  })
})
