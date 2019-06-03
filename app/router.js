const dset = require('dset')
const express = require('express')
const router = express.Router()
const paths = require('./paths')
const { getWeeksArray } = require('./utils')

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
    const primaryLeaveWeeks = getWeeksArray(res.locals.data, 'primary', 'leave')
    if (primaryLeaveWeeks.length === 0) {
      // Add compulsory leave weeks to session on initial load.
      dset(res.locals.data, 'primary.leave', ['0', '1'])
      // Note that pay during compulsory leave weeks can later be unset, but it should default to set on initial load.
      dset(res.locals.data, 'primary.pay', ['0', '1'])
    }
    res.render('planner')
  })
  .post(function (req, res) {
    res.redirect('back')
  })

module.exports = router
