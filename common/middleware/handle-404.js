const paths = require('../../app/paths')

module.exports = function handle404 (req, res) {
  if (!paths.getAllPaths().includes(req.url)) {
    res.status(404).render('error-pages/404-page')
  }
}
