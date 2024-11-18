import('govuk-frontend').then(() => { 
  window.GOVUKFrontend.initAll()
})

import('@hmcts/cookie-manager').then((cookieManager) => {
  cookieManager.on('UserPreferencesLoaded', (preferences) => {
    const dataLayer = window.dataLayer || []
    dataLayer.push({'event': 'Cookies Policy', 'cookies_policy': preferences})
  })

  cookieManager.on('UserPreferencesSaved', (preferences) => {
    const dataLayer = window.dataLayer || []
    const dtrum = window.dtrum

    dataLayer.push({'event': 'Cookies Policy', 'cookies_policy': preferences})

    if(dtrum !== undefined) {
      if(preferences.apm === 'on'){
        dtrum.enable()
        dtrum.enableSessionReplay()
      } else {
        dtrum.disableSessionReplay()
        dtrum.disable()
      }
    }
  })

  const config = {
    userPreferences: {
      cookieName: 'cookie_preferences_set',
      cookieExpiry: 365,
    },
    cookieBanner: {
      class: 'cookie-banner',
      actions: [
        {
          name: 'accept',
          buttonClass: 'cookie-banner-accept-button',
          confirmationClass: 'cookie-banner-accept-message',
          consent: true
        },
        {
          name: 'reject',
          buttonClass: 'cookie-banner-reject-button',
          confirmationClass: 'cookie-banner-reject-message',
          consent: false
        },
        {
          name: 'hide',
          buttonClass: 'cookie-banner-hide-button',
        }
      ]
    },
    preferencesForm: {
      class: 'cookie-preferences-form'
    },
    cookieManifest: [
      {
        categoryName: 'essential',
        optional: false,
        matchBy: 'exact',
        cookies: [
          'application'
        ]
      },
      {
        categoryName: 'analytics',
        optional: true,
        cookies: [
          '_ga',
          '_ga_NJ98WRPX',
          '_gat',
          '_gid'
        ]
      },
    ],
    additionalOptions: {
      defaultConsent: false,
      deleteUndefinedCookies: false, 
      disableCookieBanner: false, 
      disableCookiePreferencesForm: false
    }
  }
  
  cookieManager.init(config)
})


// cookieManager.init({
//   'user-preference-cookie-name': "cookie_preferences_set",
//   'cookie-banner-id': 'cookie_banner',
//   'cookie-banner-saved-callback': function () {
//     const banner = document.querySelector('#cookie_banner')
//     banner.hidden = true
//   },
//   'cookie-banner-visible-on-page-with-preference-form': false,
//   'user-preference-configuration-form-id': 'cm_user_preference_form',
//   'user-preference-saved-callback': function () {
//     const message = document.querySelector('#cookie-preference-success')
//     message.style.display = 'block'
//     document.body.scrollTop = 0 // For Safari
//     document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
//   },
//   'set-checkboxes-in-preference-form': true,
//   'cookie-manifest': [{
//     'category-name': 'essential',
//     optional: false,
//     cookies: [
//       'application'
//     ]
//   },
//   {
//     'category-name': 'analytics',
//     optional: true,
//     cookies: [
//       '_ga',
//       '_ga_NJ98WRPX',
//       '_gat',
//       '_gat_UA-158688524-1',
//       '_gid'
//     ]
//   }
//   ]
// })

// require('../../app/assets/javascripts/index')
