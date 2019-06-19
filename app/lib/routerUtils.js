const delve = require('dlv')
const dset = require('dset')
const paths = require('../paths')
const { isNo } = require('../../common/lib/dataUtils')
const Day = require('../../common/lib/day')
const { isYesOrNo } = require('./validationUtils')

function registerEligibilityRouteForPrimaryParents (router, path, handlers) {
  for (const parent of ['mother', 'primary-adopter']) {
    const route = router.route(paths.getPath(`eligibility.${parent}.${path}`))
    if (handlers.get) {
      route.get(handlers.get.bind(this))
    }
    if (handlers.post) {
      route.post(handlers.post.bind(this, parent))
    }
  }
}

function getParent (parentUrlPart) {
  return parentUrlPart === 'partner' ? 'secondary' : 'primary'
}

function bothParentsAreIneligible (data) {
  const primarySplEligible = delve(data, ['primary', 'spl-eligible'])
  const primaryShppEligible = delve(data, ['primary', 'shpp-eligible'])
  const secondarySplEligible = delve(data, ['secondary', 'spl-eligible'])
  const secondaryShppEligible = delve(data, ['secondary', 'shpp-eligible'])
  return isNo(primarySplEligible) &&
         isNo(primaryShppEligible) &&
         isNo(secondarySplEligible) &&
         isNo(secondaryShppEligible)
}

function parseExternalQueryString (req) {
  ['primary', 'secondary'].forEach(parent => {
    ['spl', 'shpp'].forEach(policy => {
      const parentPolicyEligibility = req.query[`${parent}-${policy}-eligible`]
      if (isYesOrNo(parentPolicyEligibility)) {
        dset(req.session.data, `${parent}.${policy}-eligible`, parentPolicyEligibility)
      }
    })
  })
  req.session.data['birth-or-adoption'] = req.query['birth-or-adoption']
  const dueDate = new Day(req.query['due-date'])
  if (dueDate.isValid()) {
    req.session.data['start-date-day'] = dueDate.date()
    req.session.data['start-date-month'] = dueDate.monthOneIndexed()
    req.session.data['start-date-year'] = dueDate.year()
  }
}

module.exports = {
  registerEligibilityRouteForPrimaryParents,
  getParent,
  bothParentsAreIneligible,
  parseExternalQueryString
}
