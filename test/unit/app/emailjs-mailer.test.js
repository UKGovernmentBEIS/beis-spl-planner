const { describe, it, beforeEach, afterEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const logger = require('../../../app/logger')

describe('sendMail', function () {
  let emailjsSendStub
  let loggerInfoStub
  let loggerErrorStub
  let sendMail // <- We will require this via proxyquire

  beforeEach(() => {
    emailjsSendStub = sinon.stub().resolves({ status: 200, text: 'OK' })
    loggerInfoStub = sinon.stub(logger, 'info')
    loggerErrorStub = sinon.stub(logger, 'error')

    sendMail = proxyquire('../../../app/emailjs-mailer', {
      '@emailjs/nodejs': {
        send: emailjsSendStub
      }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('successful email sending', function () {
    const experience = 'Great service!'
    const moreDetails = 'No additional feedback'
    const plannerText = 'Planner'
    const emailjsIds = { serviceID: 'test_service', templateID: 'test_template' }
    const options = { publicKey: 'test_public', privateKey: 'test_private' }
    const userAgent = { 'user-agent': 'test-agent' }

    it('should call emailjs.send with correct parameters', async function () {
      await sendMail(experience, moreDetails, emailjsIds, options, userAgent)

      expect(emailjsSendStub.calledOnce).to.equal(true)
      const args = emailjsSendStub.getCall(0).args
      expect(args[0]).to.equal(emailjsIds.serviceID)
      expect(args[1]).to.equal(emailjsIds.templateID)
      const templateParams = args[2]
      expect(templateParams.experience).to.equal(experience)
      expect(templateParams.moreDetails).to.equal(moreDetails)
      expect(templateParams.plannerOrEligibility).to.equal(plannerText)
      expect(templateParams.userAgent).to.equal(userAgent['user-agent'])
      expect(templateParams).to.have.property('dateTime')
      expect(args[3]).to.equal(options)
    })

    it('should log success message when email is sent successfully', async function () {
      await sendMail(experience, moreDetails, emailjsIds, options, userAgent)

      expect(loggerInfoStub.calledOnce).to.equal(true)
      const logArgs = loggerInfoStub.getCall(0).args[0]
      expect(logArgs.message).to.equal('Email sent successfully! 200 OK')
      expect(logArgs.eventType).to.equal('MailEvent')
      expect(logArgs.eventResult).to.equal('Success')
    })

    it('should handle undefined userAgent gracefully', async function () {
      const experience = 'Great service!'
      const moreDetails = 'No additional feedback'
      const emailjsIds = { serviceID: 'test_service', templateID: 'test_template' }
      const options = { publicKey: 'test_public', privateKey: 'test_private' }
      const userAgent = undefined

      await sendMail(experience, moreDetails, emailjsIds, options, userAgent)

      expect(emailjsSendStub.calledOnce).to.equal(true)
      const args = emailjsSendStub.getCall(0).args
      expect(args[0]).to.equal(emailjsIds.serviceID)
      expect(args[1]).to.equal(emailjsIds.templateID)
      const templateParams = args[2]
      expect(templateParams.experience).to.equal(experience)
      expect(templateParams.moreDetails).to.equal(moreDetails)
      expect(templateParams.userAgent).to.equal('')
      expect(templateParams).to.have.property('dateTime')
      expect(args[3]).to.equal(options)
    })
  })

  describe('failed email sending', function () {
    const experience = 'Great service!'
    const moreDetails = 'No additional feedback'
    const emailjsIds = { serviceID: 'test_service', templateID: 'test_template' }
    const options = { publicKey: 'test_public', privateKey: 'test_private' }
    const userAgent = { 'user-agent': 'test-agent' }

    it('should log error message when emailjs.send rejects', async function () {
      const error = { text: 'Error sending email' }
      emailjsSendStub.rejects(error)

      await sendMail(experience, moreDetails, emailjsIds, options, userAgent)

      expect(loggerErrorStub.calledOnce).to.equal(true)
      const logArgs = loggerErrorStub.getCall(0).args[0]
      expect(logArgs.message).to.equal('Failed to send email. Error: Error sending email')
      expect(logArgs.eventType).to.equal('MailEvent')
      expect(logArgs.eventResult).to.equal('Failure')
      expect(logArgs.errorDetails).to.equal('Error sending email')
    })

    it('should log error message when an exception occurs', async function () {
      const error = { text: 'Unexpected error' }
      emailjsSendStub.throws(error)

      await sendMail(experience, moreDetails, emailjsIds, options)

      expect(loggerErrorStub.calledOnce).to.equal(true)
      const logArgs = loggerErrorStub.getCall(0).args[0]
      expect(logArgs.message).to.equal('Error sending feedback email: Unexpected error')
      expect(logArgs.eventType).to.equal('MailEvent')
      expect(logArgs.eventResult).to.equal('Failure')
      expect(logArgs.errorDetails).to.equal('Unexpected error')
    })
  })
})
