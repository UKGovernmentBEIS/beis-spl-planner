const { describe, it, beforeEach, afterEach } = require('mocha')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const nodemailer = require('nodemailer')
const sendMail = require('../../app/node-email')

describe('sendMail', function () {
  let createTransportStub, sendMailStub

  beforeEach(() => {
    sendMailStub = sinon
      .stub()
      .yields(null, { response: '250 OK: Message accepted' })
    createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
      sendMail: sendMailStub
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('successful email sending', function () {
    const experience = 'Great service!'
    const moreDetails = 'No additional feedback'

    it('should call createTransport once', async function () {
      await sendMail(experience, moreDetails)
      expect(createTransportStub.calledOnce).to.equal(true)
    })

    it('should call sendMail once', async function () {
      await sendMail(experience, moreDetails)
      expect(sendMailStub.calledOnce).to.equal(true)
    })

    it('should set the correct email options', async function () {
      await sendMail(experience, moreDetails)
      const mailOptions = sendMailStub.getCall(0).args[0]

      expect(mailOptions.from).to.equal(
        `SPL Feedback <${process.env.EMAIL_AUTH_USER}>`
      )
      expect(mailOptions.to).to.equal(process.env.EMAIL_RECIPIENT)
      expect(mailOptions.subject).to.equal('SPL Planner Feedback')
      expect(mailOptions.text).to.contain(experience)
      expect(mailOptions.text).to.contain(moreDetails)
    })
  })
})
