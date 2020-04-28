window.GOVUKFrontend = require('govuk-frontend/govuk/all')
window.GOVUKFrontend.initAll()

const CookieBanner = require('../components/cookie-banner')
CookieBanner.addCookieMessage()

require('../../app/assets/javascripts/index')
