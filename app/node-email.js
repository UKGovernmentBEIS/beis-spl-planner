const nodemailer = require('nodemailer')

const sendMail = async (experience, moreDetails) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GMAIL_AUTH_USER,
      pass: process.env.GMAIL_AUTH_PASS
    }
  })

  // send mail with defined transport object
  await transporter.sendMail({
    from: `SPL Feedback <${process.env.GMAIL_AUTH_USER}>`, // sender address
    to: process.env.GMAIL_SENDER, // list of receivers
    subject: 'SPL Feedback', // Subject line
    text:
      `
      What was your experience of the service:
      ${experience}
      
      How could we improve this service:
      ${moreDetails}
      ` // plain text body
  }, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = sendMail
