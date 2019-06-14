const delve = require('dlv')
const paths = require('../paths')
const { isNo } = require('../../common/lib/dataUtils')

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

module.exports = {
  registerEligibilityRouteForPrimaryParents,
  getParent,
  bothParentsAreIneligible
}
