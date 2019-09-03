window.GOVUKFrontend = require('govuk-frontend/all')
window.GOVUKFrontend.initAll()

const CookieBanner = require('../components/cookie-banner')
CookieBanner.addCookieMessage()

require('../../app/assets/javascripts/index')
