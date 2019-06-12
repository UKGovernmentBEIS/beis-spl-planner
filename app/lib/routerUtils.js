const paths = require('../paths')

function registerEligibilityRouteForPrimaryParents (router, path, handlers) {
  for (const parent of ['mother', 'primary-adopter']) {
    const route = router.route(paths.getPath(`eligibility.${parent}.${path}`))
    if (handlers.get) {
      route.get(handlers.get.bind(this, parent))
    }
    if (handlers.post) {
      route.post(handlers.post.bind(this, parent))
    }
  }
}

function getParent (parentUrlPart) {
  return parentUrlPart === 'partner' ? 'secondary' : 'primary'
}

module.exports = {
  registerEligibilityRouteForPrimaryParents,
  getParent
}
