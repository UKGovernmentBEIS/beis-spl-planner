const paths = require('../paths')

function registerRouteForEachParent (router, path, handlers) {
  const parents = ['mother', 'primary-adopter', 'partner']
  for (const parent of parents) {
    const route = router.route(paths.getPath(`${path}.${parent}`))
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
  registerRouteForEachParent,
  getParent
}
