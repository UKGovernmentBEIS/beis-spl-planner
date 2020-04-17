const qs = require('qs')
const url = require('url')
const paths = require('../../app/paths')
const ShareTokenDecoder = require('../../app/lib/shareToken/shareTokenDecoder')

module.exports = function (req, res, next) {
  if (req.method === 'GET' && req.query['data-in-query']) {
    // eslint-disable-next-line node/no-deprecated-api
    const query = url.parse(req.url).query
    const queryData = qs.parse(query, { comma: true })
    const { 'data-in-query': _, ...data } = queryData
    req.session.data = data
    res.redirect(req.path)
    return
  }

  if (req.query.s1) {
    const token = req.query.s1
    req.session.data = new ShareTokenDecoder(token).decode(1)
    return res.redirect(req.path)
  }

  if (req.method === 'POST') {
    req.session.data = req.body
  } else if (!req.session.data) {
    req.session.data = {}
  }
  res.locals.data = req.session.data
  res.locals.withData = function (path) {
    const queryData = { 'data-in-query': true, ...req.session.data }
    return `${path}?${qs.stringify(queryData, { arrayFormat: 'comma' })}`
  }
  res.locals.backPath = function () {
    return res.locals.withData(paths.getPreviousWorkflowPath(req.path, req.session.data))
  }
  next()
}
