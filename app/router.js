const delve = require('dlv')
const dset = require('dset')
const express = require('express')
const router = express.Router()
const paths = require('./paths')
const validate = require('./validate')
const skip = require('./skip')
const { getBlocks, getRemainingLeaveAllowance, parseLeaveBlocks } = require('./lib/blocks')
const { getWeeksArray } = require('./utils')
const {
  registerEligibilityRouteForPrimaryParents,
  registerPlannerRouteForPrimaryLeaveTypes,
  bothParentsAreIneligible,
  parseExternalQueryString
} = require('./lib/routerUtils')
const { isBirth, isYes } = require('../common/lib/dataUtils')

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
      return res.redirect(paths.getPreviousWorkflowPath(req.url, req.session.data))
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
      return res.redirect(paths.getPreviousWorkflowPath(req.url, req.session.data))
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
      return res.redirect(paths.getPreviousWorkflowPath(req.url, req.session.data))
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

registerPlannerRouteForPrimaryLeaveTypes(router, 'start', {
  get: function (req, res) {
    res.render('accessible-planner/primary-leave-start')
  },
  post: function (parentUrlPart, req, res) {
    // TODO: validate
    res.redirect(paths.getPath(`planner.${parentUrlPart}.end`))
  }
})

registerPlannerRouteForPrimaryLeaveTypes(router, 'end', {
  get: function (req, res) {
    res.render('accessible-planner/primary-leave-end')
  },
  post: function (parentUrlPart, req, res) {
    // TODO: validate
    dset(req.session.data, 'leave-blocks.primary.spl', undefined)
    res.redirect(paths.getPath('planner.paternity-leave'))
  }
})

router.route(paths.getPath('planner.paternity-leave'))
  .get(function (req, res) {
    res.render('accessible-planner/paternity-leave')
  })
  .post(function (req, res) {
    const isTakingPaternityLeave = delve(req.session.data, 'leave-blocks.secondary.is-taking-paternity-leave')
    if (isYes(isTakingPaternityLeave)) {
      res.redirect(paths.getPath('planner.paternity-leave.start'))
    } else {
      res.redirect(paths.getPath('planner.shared-parental-leave'))
    }
  })

router.route(paths.getPath('planner.paternity-leave.start'))
  .get(function (req, res) {
    res.render('accessible-planner/paternity-leave-start')
  })
  .post(function (req, res) {
    const paternityLeaveStart = delve(req.session.data, 'leave-blocks.secondary.initial.start')
    if (parseInt(paternityLeaveStart) === 7) {
      // Week 7 is the last week that is eligible for paternity leave, so leave must also end in this week.
      dset(req.session.data, 'leave-blocks.secondary.initial.end', 7)
      res.redirect(paths.getPath('planner.shared-parental-leave'))
    } else {
      res.redirect(paths.getPath('planner.paternity-leave.end'))
    }
  })

router.route(paths.getPath('planner.paternity-leave.end'))
  .get(function (req, res) {
    res.render('accessible-planner/paternity-leave-end')
  })
  .post(function (req, res) {
    dset(req.session.data, 'leave-blocks.secondary.spl', undefined)
    res.redirect(paths.getPath('planner.shared-parental-leave'))
  })

router.route(paths.getPath('planner.shared-parental-leave'))
  .get(function (req, res) {
    res.render('accessible-planner/shared-parental-leave')
  })
  .post(function (req, res) {
    const { data } = req.session
    const blockHistory = delve(data, 'leave-blocks.spl-block-planning-order', [])
    const nextBlock = blockHistory[blockHistory.length - 1]
    if (nextBlock === 'done') {
      res.redirect(paths.getPath('summary'))
    } else {
      const parent = nextBlock
      const splBlockDataObject = delve(data, ['leave-blocks', parent, 'spl'], {})
      const blocksLength = Object.keys(splBlockDataObject).length

      let blockIndex
      if (blocksLength === 0) {
        blockIndex = 0
      } else {
        const lastBlockIndex = blocksLength - 1
        const lastBlock = splBlockDataObject[`_${lastBlockIndex}`]
        // If the last block is complete, we are starting a new one.
        blockIndex = (lastBlock.start && lastBlock.end) ? lastBlockIndex + 1 : lastBlockIndex
      }
      dset(data, ['leave-blocks', parent, 'spl', `_${blockIndex}`, 'leave'], 'shared')
      res.redirect(paths.getPath('planner.shared-parental-leave.start'))
    }
  })

router.route(paths.getPath('planner.shared-parental-leave.start'))
  .get(function (req, res) {
    res.render('accessible-planner/shared-parental-leave-start')
  })
  .post(function (req, res) {
    res.redirect(paths.getPath('planner.shared-parental-leave.end'))
  })

router.route(paths.getPath('planner.shared-parental-leave.end'))
  .get(function (req, res) {
    res.render('accessible-planner/shared-parental-leave-end')
  })
  .post(function (req, res) {
    const leaveBlocks = parseLeaveBlocks(req.session.data['leave-blocks'])
    if (getRemainingLeaveAllowance(leaveBlocks) > 0) {
      res.redirect(paths.getPath('planner.shared-parental-leave'))
    } else {
      res.redirect(paths.getPath('summary'))
    }
  })

router.route(paths.getPath('summary'))
  .get(function (req, res) {
    const { leaveBlocks, payBlocks } = getBlocks(req.session.data)
    res.render('summary', { leaveBlocks, payBlocks })
  })

router.route(paths.getPath('cookies'))
  .get(function (req, res) {
    const referrer = req.header('Referrer')
    res.render('privacy/cookies', { referrer })
  })

module.exports = router
