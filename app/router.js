const express = require('express')
const router = express.Router()
const paths = require('./paths')

router.route(paths.getPath('root'))
  .get(function (req, res) {
    res.render('index')
  })
  .post(function (req, res) {
    res.redirect(paths.birthOrAdoption)
  })

router.route(paths.birthOrAdoption)
  .get(function (req, res) {
    res.render('birth-or-adoption')
  })
  .post(function (req, res) {
    res.redirect(paths.planner)
  })

router.route(paths.planner)
  .get(function (req, res) {
    res.render('planner')
  })
  .post(function (req, res) {
    res.redirect('back')
  })

module.exports = router
