require('dotenv').config()
const emailjs = require('@emailjs/nodejs')
const logger = require('./logger')

const sendMail = async (experience, moreDetails, reqHeaders) => {
  const currentDateTime = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  let formattedHeaders = ''
  for (const [key, value] of Object.entries(reqHeaders)) {
    formattedHeaders += `${key}: ${value}\n`
  }

  const templateParams = {
    experience: experience,
    moreDetails: moreDetails,
    reqHeaders: formattedHeaders,
    dateTime: currentDateTime
  }

  const options = {
    publicKey: `${process.env.EMAILJS_PUBLIC_KEY}`,
    privateKey: `${process.env.EMAILJS_PRIVATE_KEY}`
  }

  const serviceID = `${process.env.EMAILJS_SERVICE_ID}`
  const templateID = `${process.env.EMAILJS_TEMPLATE_ID}`

  try {
    await emailjs.send(serviceID, templateID, templateParams, options)
      .then((response) => {
        logger.info({
          message: `Email sent successfully! ${response.status} ${response.text}`,
          eventType: 'MailEvent',
          eventResult: 'Success'
        })
      })
      .catch((err) => {
        logger.error({
          message: `Failed to send email. Error: ${err.text}`,
          eventType: 'MailEvent',
          eventResult: 'Failure',
          errorDetails: err.text
        })
      })
  } catch (err) {
    logger.error({
      message: `Error sending feedback email: ${err.text}`,
      eventType: 'MailEvent',
      eventResult: 'Failure',
      errorDetails: err.text
    })
  }
}

module.exports = sendMail
