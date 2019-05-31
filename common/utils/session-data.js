const qs = require('qs')
const paths = require('../../app/paths')

module.exports = function (req, res, next) {
  if (req.method === 'GET' && req.query['data-in-query']) {
    const { 'data-in-query': _, ...data } = req.query
    req.session.data = data
    res.redirect(req.path)
    return
  }

  if (req.method === 'POST') {
    req.session.data = req.body
  } else if (!req.session.data) {
    req.session.data = {}
  }
  res.locals.data = req.session.data
  res.locals.withData = function (path) {
    const queryData = { 'data-in-query': true, ...req.session.data }
    const backPath = paths.getPreviousWorkFlowPath(req.path)
    return `${backPath}?${qs.stringify(queryData)}`
  }
  next()
}
