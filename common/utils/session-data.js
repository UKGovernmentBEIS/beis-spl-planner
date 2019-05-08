module.exports = function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {}
  }
  res.locals.data = function (key) {
    return key ? req.session.data[key] : req.session.data
  }
  next()
}
