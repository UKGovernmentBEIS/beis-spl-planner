// Adapted from cookie-banner.js in the GOV.UK Design System.
// See: https://github.com/alphagov/govuk-design-system/blob/8e3e9e9674a4c2f499ac4e05ea00c6efda0c93e5/src/javascripts/components/cookie-banner.js

/*
  Cookie methods
  ==============
  Usage:
    Setting a cookie:
    CookieBanner.init('hobnob', 'tasty', { days: 30 });
    Reading a cookie:
    CookieBanner.init('hobnob');
    Deleting a cookie:
    CookieBanner.init('hobnob', null);
*/
const CookieBanner = {
  init: function (name, value, options) {
    if (typeof value !== 'undefined') {
      if (value === false || value === null) {
        return CookieBanner.setCookie(name, '', { days: -1 })
      } else {
        return CookieBanner.setCookie(name, value, options)
      }
    } else {
      return CookieBanner.getCookie(name)
    }
  },
  setCookie: function (name, value, options) {
    if (typeof options === 'undefined') {
      options = {}
    }
    let cookieString = name + '=' + value + '; path=/'
    if (options.days) {
      const date = new Date()
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
      cookieString = cookieString + '; expires=' + date.toGMTString()
    }
    if (document.location.protocol === 'https:') {
      cookieString = cookieString + '; Secure'
    }
    document.cookie = cookieString
  },
  getCookie: function (name) {
    const nameEQ = name + '='
    const cookies = document.cookie.split(';')
    for (var i = 0, len = cookies.length; i < len; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length))
      }
    }
    return null
  },
  addCookieMessage: function () {
    const message = document.querySelector('.cookie-banner')
    const hasCookieMessage = (message && CookieBanner.init('seen_cookie_message') === null)

    if (hasCookieMessage) {
      message.style.display = 'block'
      CookieBanner.init('seen_cookie_message', 'yes', { days: 28 })
    }
  }
}

module.exports = CookieBanner
