const nodemailer = require('nodemailer')

const sendMail = async (experience, moreDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS
    }
  })

  await transporter.sendMail({
    from: `SPL Feedback <${process.env.EMAIL_AUTH_USER}>`,
    to: process.env.EMAIL_RECIPIENT,
    subject: 'SPL Feedback',
    text:
      `
      What was your experience of the service:
      ${experience}
      
      How could we improve this service:
      ${moreDetails}
      `
  }, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = sendMail
