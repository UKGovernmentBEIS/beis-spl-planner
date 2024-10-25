const { NODE_ENV, LOG_LEVEL } = process.env

const config = {
  isProd: NODE_ENV === 'production',
  isDev: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
  logLevel: LOG_LEVEL || 'info',
  emailJSPublicKey: process.env.EMAILJS_PUBLIC_KEY,
  emailJSPrivateKey: process.env.EMAILJS_PRIVATE_KEY,
  emailJSServiceID: process.env.EMAILJS_SERVICE_ID,
  emailJSTemplateID: process.env.EMAILJS_TEMPLATE_ID
}

module.exports = config
