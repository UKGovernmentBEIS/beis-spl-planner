/* global gtag */

const { getGaFields, getBirthOrAdoption } = require('../../../common/lib/analyticsUtils')

document.querySelectorAll('[data-ga-hit-type]').forEach(element => {
  const gaFields = getGaFields(element)
  const gaHitType = element.getAttribute('data-ga-hit-type')
  element.addEventListener('click', function (e) {
    gaFields['birth_or_adoption'] = gaFields['birth_or_adoption'] || getBirthOrAdoption()
    gtag('event', gaHitType, gaFields)
  })
})

function calendarHasBeenUsed () {
  const gaFields = {
    event_category: 'planner',
    event_action: 'planner_interaction',
    birth_or_adoption: getBirthOrAdoption()
  }
  gtag('event', 'planner_interaction', gaFields)
}

window.analytics = {
  calendarHasBeenUsed
}
