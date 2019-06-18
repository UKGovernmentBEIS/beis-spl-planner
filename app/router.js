const express = require('express')
const router = express.Router()
const paths = require('./paths')

router.route(paths.getPath('root'))
  .get(function (req, res) {
    res.render('index', { message: 'Hello world!' })
  })

router.use(function (req, res) {
  if (!paths.getAllPaths().includes(req.url)) {
    res.status(404).render('./404-page')
  }
})

module.exports = router
