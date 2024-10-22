require('dotenv').config()
const emailjs = require('@emailjs/nodejs')

const sendMail = async (experience, moreDetails, reqHeaders) => {
  const templateParams = {
    experience: experience,
    moreDetails: moreDetails,
    reqHeaders: reqHeaders
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
        console.log('Email sent successfully!', response.status, response.text)
      })
      .catch((err) => {
        console.error('Failed to send email. Error:', err)
      })
  } catch (err) {
    console.error('Error sending feedback email:', err)
  }
}

module.exports = sendMail
