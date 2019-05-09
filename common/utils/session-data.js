module.exports = function (req, res, next) {
  if (req.method === 'POST') {
    req.session.data = req.body
  } else if (!req.session.data) {
    req.session.data = {}
  }
  res.locals.data = req.session.data
  next()
}
