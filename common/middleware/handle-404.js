module.exports = function handle404 (req, res) {
  res.status(404).render('error-pages/404-page')
}
