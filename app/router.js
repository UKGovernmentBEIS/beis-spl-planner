const express = require('express')
const router = express.Router()
const paths = require('./paths')

router.route(paths.root)
  .get(function (req, res) {
    res.render('index', { message: 'Hello world!' })
  })

module.exports = router
