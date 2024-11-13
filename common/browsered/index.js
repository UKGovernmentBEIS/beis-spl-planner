window.GOVUKFrontend = require('../../node_modules/govuk-frontend/dist/govuk/all.bundle.js')
window.GOVUKFrontend.initAll()

const cookieManager = require('../../node_modules/@dvsa/cookie-manager/cookie-manager.js')
cookieManager.init({
  'cookie-banner-id': 'cookie_banner',
  'cookie-banner-saved-callback': function () {
    const banner = document.querySelector('#cookie_banner')
    banner.hidden = true
  },
  'cookie-banner-visible-on-page-with-preference-form': false,
  'user-preference-configuration-form-id': 'cm_user_preference_form',
  'user-preference-saved-callback': function () {
    const message = document.querySelector('#cookie-preference-success')
    message.style.display = 'block'
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
  },
  'set-checkboxes-in-preference-form': true,
  'cookie-manifest': [{
    'category-name': 'essential',
    optional: false,
    cookies: [
      'application'
    ]
  },
  {
    'category-name': 'analytics',
    optional: true,
    cookies: [
      '_ga',
      '_gid',
      '_gat_UA-158688524-1'
    ]
  }
  ]
})

require('../../app/assets/javascripts/index')
