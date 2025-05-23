const qs = require('qs')
const { URL } = require('url')
const paths = require('../../app/paths')
const ShareTokenDecoder = require('../../app/lib/shareToken/shareTokenDecoder')

module.exports = function (req, res, next) {
  if (req.method === 'GET' && req.query['data-in-query']) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const query = parsedUrl.search
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

  req.session.data.backPathForHelpPages = paths.isWorkFlowPage(req.path)
    ? req.path
    : req.session.data.backPathForHelpPages

  res.locals.data = req.session.data
  res.locals.withData = function (path) {
    const queryData = { 'data-in-query': true, ...req.session.data }
    return `${path}?${qs.stringify(queryData, { arrayFormat: 'brackets' })}`
  }
  res.locals.backPath = function () {
    const previousPath = paths.getPreviousWorkflowPath(req.path, req.session.data);
    if (!previousPath) {
      console.warn(`[backPath] Unable to determine previous path from current path: '${req.path}' with session data:`, req.session.data);
      // Fallback to a default path if previousPath is undefined
      return '/start';
    }
    return res.locals.withData(previousPath);
  }
  next()
}
