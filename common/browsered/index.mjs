import('../../node_modules/@hmcts/cookie-manager/dist/cookie-manager.js').then((module) => {
  const cookieManager = module.default

  cookieManager.on('CookieBannerAction', (actionName) => {
    const acceptMessage = document.querySelector('.cookie-banner-accept-message')
    const rejectMessage = document.querySelector('.cookie-banner-reject-message')
    const cookieBanner = document.querySelector('.cookie-banner')
    if(actionName === 'accept'){
      console.log('User accepted cookies')
      cookieBanner.hidden = true
      acceptMessage.hidden = false
    } else if (actionName === 'reject') {
      console.log('User rejected cookies')
      cookieBanner.hidden = true
      rejectMessage.hidden = false
    } else if (actionName === 'hide') {
      acceptMessage.hidden = true
      rejectMessage.hidden = true
    }
  })

  cookieManager.on('CookieBannerInitialized', () => {
    console.log('Cookie banner has been initialized')
    const cookieBanner = document.querySelector('.cookie-banner')
    cookieBanner.hidden = false
  })
  
  cookieManager.on('CookieManagerLoaded', () => {
    console.log('Cookie manager has finished loading and adding event listeners')
  })

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
