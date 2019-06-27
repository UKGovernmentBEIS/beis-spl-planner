const dset = require('dset')
const express = require('express')
const router = express.Router()
const paths = require('./paths')
const validate = require('./validate')
const skip = require('./skip')
const { getBlocks } = require('./lib/blocks')
const { getWeeksArray } = require('./utils')
const {
  registerEligibilityRouteForPrimaryParents,
  bothParentsAreIneligible,
  parseExternalQueryString
} = require('./lib/routerUtils')
const { isBirth } = require('../common/lib/dataUtils')

router.use('/planner/examples', require('./router.examples'))

router.use('/forms', require('./router.forms'))

router.route(paths.getPath('root'))
  .get(function (req, res) {
    if (req.query) {
      parseExternalQueryString(req)
    }
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
    if (!validate.birthOrAdoption(req)) {
      return res.redirect('back')
    }
    const primaryParent = isBirth(req.session.data) ? 'mother' : 'primary-adopter'
    res.redirect(paths.getPath(`eligibility.${primaryParent}.sharedParentalLeaveAndPay`))
  })

registerEligibilityRouteForPrimaryParents(router, 'sharedParentalLeaveAndPay', {
  get: function (req, res) {
    res.render('eligibility/primary-shared-parental-leave-and-pay')
  },
  post: function (parentUrlPart, req, res) {
    if (!validate.primarySharedParentalLeaveAndPay(req)) {
      return res.redirect('back')
    }
    if (skip.initialLeaveAndPay(req) && skip.maternityAllowance(req)) {
      res.redirect(paths.getPath('eligibility.partner.sharedParentalLeaveAndPay'))
    } else if (skip.initialLeaveAndPay(req)) {
      res.redirect(paths.getPath(`eligibility.${parentUrlPart}.maternityAllowance`))
    } else {
      res.redirect(paths.getPath(`eligibility.${parentUrlPart}.initialLeaveAndPay`))
    }
  }
})

registerEligibilityRouteForPrimaryParents(router, 'initialLeaveAndPay', {
  get: function (req, res) {
    if (skip.initialLeaveAndPay(req)) {
      return res.redirect(paths.getPreviousWorkFlowPath(req.url))
    }
    res.render('eligibility/primary-initial-leave-and-pay')
  },
  post: function (parentUrlPart, req, res) {
    if (!validate.initialLeaveAndPay(req)) {
      return res.redirect('back')
    }
    if (skip.maternityAllowance(req)) {
      res.redirect(paths.getPath('eligibility.partner.sharedParentalLeaveAndPay'))
    } else {
      res.redirect(paths.getPath(`eligibility.${parentUrlPart}.maternityAllowance`))
    }
  }
})

registerEligibilityRouteForPrimaryParents(router, 'maternityAllowance', {
  get: function (req, res) {
    if (skip.maternityAllowance(req)) {
      return res.redirect(paths.getPreviousWorkFlowPath(req.url))
    }
    res.render('eligibility/maternity-allowance')
  },
  post: function (_, req, res) {
    if (!validate.maternityAllowance(req)) {
      return res.redirect('back')
    }
    res.redirect(paths.getPath(`eligibility.partner.sharedParentalLeaveAndPay`))
  }
})

router.route(paths.getPath('eligibility.partner.sharedParentalLeaveAndPay'))
  .get(function (req, res) {
    res.render('eligibility/secondary-shared-parental-leave-and-pay')
  })
  .post(function (req, res) {
    if (!validate.secondarySharedParentalLeaveAndPay(req)) {
      return res.redirect('back')
    }
    if (bothParentsAreIneligible(req.session.data)) {
      res.redirect(paths.getPath('notEligible'))
    } else if (skip.paternityLeaveAndPay(req)) {
      res.redirect(paths.getPath('startDate'))
    } else {
      res.redirect(paths.getPath('eligibility.partner.paternityLeaveAndPay'))
    }
  })

router.route(paths.getPath('eligibility.partner.paternityLeaveAndPay'))
  .get(function (req, res) {
    if (skip.paternityLeaveAndPay(req)) {
      return res.redirect(paths.getPreviousWorkFlowPath(req.url))
    }
    res.render('eligibility/paternity-leave-and-pay')
  })
  .post(function (req, res) {
    if (!validate.paternityLeaveAndPay(req)) {
      return res.redirect('back')
    }
    res.redirect(paths.getPath('startDate'))
  })

router.route(paths.getPath('notEligible'))
  .get(function (req, res) {
    res.render('eligibility/not-eligible')
  })

router.route(paths.getPath('startDate'))
  .get(function (req, res) {
    res.render('start-date')
  })
  .post(function (req, res) {
    if (!validate.startDate(req)) {
      return res.redirect('back')
    }
    res.redirect(paths.getPath('parentSalaries'))
  })

router.route(paths.getPath('parentSalaries'))
  .get(function (req, res) {
    res.render('parent-salaries')
  })
  .post(function (req, res) {
    if (!validate.parentSalaries(req)) {
      return res.redirect('back')
    }
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
    res.redirect(paths.getPath('summary'))
  })

router.route(paths.getPath('summary'))
  .get(function (req, res) {
    const { leaveBlocks, payBlocks } = getBlocks(req.session.data)
    res.render('summary', { leaveBlocks, payBlocks })
  })

router.route(paths.getPath('feedback'))
  .get(function (req, res) {
    const referrer = req.header('Referrer')
    res.render('feedback/feedback', { referrer })
  })

module.exports = router
