/* global gtag */

const { getGaFields, getBirthOrAdoption } = require('../../../common/lib/analyticsUtils')

window.addEventListener('load', () => {
  document.querySelectorAll('[data-ga-hit-type]').forEach(element => {
    const gaFields = getGaFields(element)
    const gaHitType = element.getAttribute('data-ga-hit-type')
    element.addEventListener('click', function (e) {
      gaFields['birth_or_adoption'] = gaFields['birth_or_adoption'] || getBirthOrAdoption()
      gtag('event', gaHitType, gaFields)
    })
  })
})

function trackFirstCalendarUsage () {
  let hasBeenUsed = false
  Array.from(document.querySelectorAll('#calendar-checkboxes input[type=checkbox]')).forEach(checkbox => {
    checkbox.addEventListener('change', function (_) {
      if (!hasBeenUsed) {
        sendCalendarHasBeenUsed()
        hasBeenUsed = true
      }
    })
  })
}

function sendCalendarHasBeenUsed () {
  const gaFields = {
    event_category: 'planner',
    event_action: 'planner_interaction',
    birth_or_adoption: getBirthOrAdoption()
  }
  gtag('event', 'planner_interaction', gaFields)
}

window.analytics = {
  trackFirstCalendarUsage
}
