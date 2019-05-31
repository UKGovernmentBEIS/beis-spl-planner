const express = require('express')
const router = express.Router()
const paths = require('./paths')

router.route(paths.getPath('root'))
  .get(function (req, res) {
    res.render('index')
  })
  .post(function (req, res) {
    res.redirect(paths.getPath('birthOrAdoption'))
  })

router.route(paths.getPath('birthOrAdoption'))
  .get(function (req, res) {
    res.render('birth-or-adoption')
  })
  .post(function (req, res) {
    res.redirect(paths.getPath('planner'))
  })

router.route(paths.getPath('planner'))
  .get(function (req, res) {
    res.render('planner')
  })
  .post(function (req, res) {
    res.redirect('back')
  })

module.exports = router
