const paths = require('../../app/paths')

module.exports = function (req, res, next) {
  const earliestPathWithValidationErrors = getEarliestPathWithValidationErrors(paths.getPreviousWorkFlowPath(req.path), req)
  if (earliestPathWithValidationErrors) {
    res.redirect(earliestPathWithValidationErrors)
  } else {
    next()
  }
}

function getEarliestPathWithValidationErrors (path, req) {
  if (!path) {
    return null
  }

  const previousPath = paths.getPreviousWorkFlowPath(path)
  const earliestPathWithValidationErrors = getEarliestPathWithValidationErrors(previousPath, req)
  if (earliestPathWithValidationErrors) {
    return earliestPathWithValidationErrors
  }

  const validator = paths.getValidator(path)
  const isValid = validator ? validator(req) : true
  return isValid ? null : path
}
