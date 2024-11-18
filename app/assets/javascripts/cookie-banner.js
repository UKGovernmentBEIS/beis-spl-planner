document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.querySelector('.cookie-banner')
    document.querySelector('.cookie-banner-accept-button').addEventListener('click', function() {
        cookieBanner.hidden = true
    })
})