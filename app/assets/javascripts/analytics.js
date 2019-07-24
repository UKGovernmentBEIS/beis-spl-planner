/* global gtag */

const { getGaFields, getNatureOfParenthood } = require('../../../common/lib/analyticsUtils')

window.addEventListener('load', () => {
  document.querySelectorAll('[data-ga-hit-type]').forEach(element => {
    const gaFields = getGaFields(element)
    const gaHitType = element.getAttribute('data-ga-hit-type')
    element.addEventListener('click', function (e) {
      gaFields['nature_of_parenthood'] = gaFields['nature_of_parenthood'] || getNatureOfParenthood()
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
    nature_of_parenthood: getNatureOfParenthood()
  }
  gtag('event', 'planner_interaction', gaFields)
}

function trackShareLinkUsage (category) {
  document.querySelectorAll('.share-link').forEach(link => {
    link.addEventListener('copy', function (_) {
      const gaFields = {
        event_category: category,
        event_action: 'share_link_copied',
        nature_of_parenthood: getNatureOfParenthood()
      }
      gtag('event', 'share_planner', gaFields)
    })
  })
}

function planner () {
  trackFirstCalendarUsage()
  trackShareLinkUsage('planner')
}

function summary () {
  trackShareLinkUsage('summary')
}

window.analytics = {
  planner,
  summary
}
