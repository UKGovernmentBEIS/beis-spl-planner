const paths = require('../../app/paths')

module.exports = function (req, res, next) {
  const previousWorkflowPath = paths.getPreviousWorkflowPath(req.path, req.session.data)
  const earliestPathWithValidationErrors = getEarliestPathWithValidationErrors(previousWorkflowPath, req)

  const redirectDisabled = (process.env.NODE_ENV !== 'production' && process.env.PA11Y_TEST === 'true')

  if (earliestPathWithValidationErrors && !redirectDisabled) {
    res.redirect(earliestPathWithValidationErrors)
  } else {
    next()
  }
}

function getEarliestPathWithValidationErrors (path, req, visitedPaths = new Set()) {
  if (!path) {
    return null
  }

  if (visitedPaths.has(path)) {
    console.warn(`Circular reference detected for path: ${path}`)
    return null
  }

  visitedPaths.add(path)

  const previousPath = paths.getPreviousWorkflowPath(path, req.session.data, true)
  const earliestPathWithValidationErrors = getEarliestPathWithValidationErrors(previousPath, req, visitedPaths)

  if (earliestPathWithValidationErrors) {
    return earliestPathWithValidationErrors
  }

  const validator = paths.getValidator(path)
  const isValid = validator ? validator(req) : true

  return isValid ? null : path
}
