const delve = require('dlv')
const { dset } = require('dset')
const express = require('express')
const emailJSEmail = require('./emailjs-mailer')
const router = express.Router()
const paths = require('./paths')
const validate = require('./validate')
const skip = require('./skip')
const config = require('./config')
const {
  getBlocks,
  getRemainingLeaveAllowance,
  parseLeaveBlocks
} = require('./lib/blocks')
const { getWeeksArray } = require('./utils')
const {
  registerEligibilityRouteForPrimaryParents,
  registerEligibilityRouteForBirthMother,
  registerPlannerRouteForPrimaryLeaveTypes,
  bothParentsAreIneligible,
  parseExternalQueryString,
  clearLaterLeaveBlockAnswers,
  clearLaterSplBlocks,
  clearCurrenttSplBlockIfIncomplete,
  clearCurrentSplBlockStart,
  clearCurrentSplBlockEnd,
  getJourneyTime
} = require('./lib/routerUtils')
const dataUtils = require('../common/lib/dataUtils')
const ShareTokenEncoder = require('./lib/shareToken/shareTokenEncoder')
const healthcheck = require('./lib/healthcheck')
const logger = require('./logger')

// EmailJS configuration
const options = {
  publicKey: config.emailJSPublicKey,
  privateKey: config.emailJSPrivateKey
}
const emailjsIds = {
  serviceID: config.emailJSServiceID,
  templateID: config.emailJSTemplateID
}

router.use(healthcheck)

router.use('/planner/examples', require('./router.examples'))

// TODO: Are we re-instating the pre-filled forms?
// router.use('/forms', require('./router.forms'))
router.use('/forms', express.static('./app/forms'))

router.route(paths.getPath('root')).get(function (req, res) {
  req.session.timings = req.session.timings || {}
  if (Object.entries(req.query).length !== 0) {
    parseExternalQueryString(req)
  }
  req.session.timings.plannerStart =
    req.session.timings.plannerStart || Date.now()
  res.redirect(paths.getPath('natureOfParenthood'))
})

router
  .route(paths.getPath('natureOfParenthood'))
  .get(function (req, res) {
    req.session.timings = req.session.timings || { plannerStart: Date.now() }
    res.render('nature-of-parenthood')
  })
  .post(function (req, res) {
    if (!validate.natureOfParenthood(req)) {
      return res.redirect(req.path)
    }
    if (skip.typeOfAdoption(req)) {
      const parentName = dataUtils.parentNameForUrl(
        req.session.data,
        'primary'
      )
      res.redirect(
        paths.getPath(`eligibility.${parentName}.sharedParentalLeaveAndPay`)
      )
    } else {
      res.redirect(paths.getPath('typeOfAdoption'))
    }
  })

router
  .route(paths.getPath('typeOfAdoption'))
  .get(function (req, res) {
    if (skip.typeOfAdoption(req)) {
      return res.redirect('nature-of-parenthood')
    }
    res.render('type-of-adoption')
  })
  .post(function (req, res) {
    if (!validate.typeOfAdoption(req)) {
      return res.redirect(req.path)
    }
    res.redirect(
      paths.getPath('eligibility.primary-adopter.sharedParentalLeaveAndPay')
    )
  })

registerEligibilityRouteForPrimaryParents(router, 'sharedParentalLeaveAndPay', {
  get: function (req, res) {
    res.render('eligibility/primary-shared-parental-leave-and-pay')
  },
  post: function (parentUrlPart, req, res) {
    if (!validate.primarySharedParentalLeaveAndPay(req)) {
      return res.redirect(req.path)
    }
    if (skip.initialLeaveAndPay(req) && skip.maternityAllowance(req)) {
      res.redirect(
        paths.getPath('eligibility.partner.sharedParentalLeaveAndPay')
      )
    } else if (skip.initialLeaveAndPay(req)) {
      res.redirect(
        paths.getPath(`eligibility.${parentUrlPart}.maternityAllowance`)
      )
    } else {
      res.redirect(
        paths.getPath(`eligibility.${parentUrlPart}.initialLeaveAndPay`)
      )
    }
  }
})

registerEligibilityRouteForPrimaryParents(router, 'initialLeaveAndPay', {
  get: function (req, res) {
    if (skip.initialLeaveAndPay(req)) {
      return res.redirect(
        paths.getPreviousWorkflowPath(req.url, req.session.data)
      )
    }
    res.render('eligibility/primary-initial-leave-and-pay')
  },
  post: function (parentUrlPart, req, res) {
    if (!validate.initialLeaveAndPay(req)) {
      return res.redirect(req.path)
    }
    if (dataUtils.isPrimaryIneligible(req.session.data)) {
      res.redirect(paths.getPath('notEligible'))
    } else if (skip.maternityAllowance(req)) {
      res.redirect(
        paths.getPath('eligibility.partner.sharedParentalLeaveAndPay')
      )
    } else {
      res.redirect(
        paths.getPath(`eligibility.${parentUrlPart}.maternityAllowance`)
      )
    }
  }
})

registerEligibilityRouteForBirthMother(router, 'maternityAllowance', {
  get: function (req, res) {
    if (skip.maternityAllowance(req)) {
      return res.redirect(
        paths.getPreviousWorkflowPath(req.url, req.session.data)
      )
    }
    res.render('eligibility/maternity-allowance')
  },
  post: function (_, req, res) {
    if (!validate.maternityAllowance(req)) {
      return res.redirect(req.path)
    } else if (dataUtils.isPrimaryIneligible(req.session.data)) {
      res.redirect(paths.getPath('notEligible'))
    } else {
      res.redirect(
        paths.getPath('eligibility.partner.sharedParentalLeaveAndPay')
      )
    }
  }
})

router
  .route(paths.getPath('eligibility.partner.sharedParentalLeaveAndPay'))
  .get(function (req, res) {
    res.render('eligibility/secondary-shared-parental-leave-and-pay')
  })
  .post(function (req, res) {
    if (!validate.secondarySharedParentalLeaveAndPay(req)) {
      return res.redirect(req.path)
    }
    if (bothParentsAreIneligible(req.session.data)) {
      res.redirect(paths.getPath('notEligible'))
    } else if (skip.paternityLeaveAndPay(req)) {
      res.redirect(paths.getPath('startDate'))
    } else {
      res.redirect(paths.getPath('eligibility.partner.paternityLeaveAndPay'))
    }
  })

router
  .route(paths.getPath('eligibility.partner.paternityLeaveAndPay'))
  .get(function (req, res) {
    if (skip.paternityLeaveAndPay(req)) {
      return res.redirect(
        paths.getPreviousWorkflowPath(req.url, req.session.data)
      )
    }
    res.render('eligibility/paternity-leave-and-pay')
  })
  .post(function (req, res) {
    if (!validate.paternityLeaveAndPay(req)) {
      return res.redirect(req.path)
    }
    res.redirect(paths.getPath('startDate'))
  })

router.route(paths.getPath('notEligible')).get(function (req, res) {
  res.render('eligibility/not-eligible')
})

router
  .route(paths.getPath('startDate'))
  .get(function (req, res) {
    res.render('start-date')
  })
  .post(function (req, res) {
    if (!validate.startDate(req)) {
      return res.redirect(req.path)
    }
    res.redirect(paths.getPath('parentSalaries'))
  })

router
  .route(paths.getPath('parentSalaries'))
  .get(function (req, res) {
    res.render('parent-salaries')
  })
  .post(function (req, res) {
    if (!validate.parentSalaries(req)) {
      return res.redirect(req.path)
    }
    res.redirect(paths.getPath('planner'))
  })

router
  .route(paths.getPath('planner'))
  .get(function (req, res) {
    req.session.timings = req.session.timings || { plannerStart: Date.now() }
    const { data } = req.session
    const primaryLeaveWeeks = getWeeksArray(data, 'primary', 'leave')
    if (primaryLeaveWeeks.length === 0) {
      // Add first two weeks after birth or placement to session on initial load.
      dset(data, 'primary.leave', ['0', '1'])
      dset(data, 'primary.pay', ['0', '1'])
    }
    // Remove any data from the question based planner.
    delete data['leave-blocks']
    res.render('planner')
  })
  .post(function (req, res) {
    req.session.data.visualPlanner = true
    res.redirect(paths.getPath('summary'))
  })

registerPlannerRouteForPrimaryLeaveTypes(router, 'start', {
  get: function (req, res) {
    clearLaterLeaveBlockAnswers(req, 'primary.initial.start')
    res.render('accessible-planner/primary-leave-start')
  },
  post: function (parentUrlPart, req, res) {
    res.redirect(paths.getPath(`planner.${parentUrlPart}.end`))
  }
})

registerPlannerRouteForPrimaryLeaveTypes(router, 'end', {
  get: function (req, res) {
    clearLaterLeaveBlockAnswers(req, 'primary.initial.end')
    res.render('accessible-planner/primary-leave-end')
  },
  post: function (parentUrlPart, req, res) {
    res.redirect(paths.getPath('planner.paternity-leave'))
  }
})

router
  .route(paths.getPath('planner.paternity-leave'))
  .get(function (req, res) {
    clearLaterLeaveBlockAnswers(req, 'secondary.is-taking-paternity-leave')
    res.render('accessible-planner/paternity-leave')
  })
  .post(function (req, res) {
    if (!validate.paternityLeaveQuestion(req)) {
      return res.redirect(req.path)
    }
    const isTakingPaternityLeave = delve(
      req.session.data,
      'leave-blocks.secondary.is-taking-paternity-leave'
    )
    if (dataUtils.isYes(isTakingPaternityLeave)) {
      res.redirect(paths.getPath('planner.paternity-leave.start'))
    } else {
      res.redirect(paths.getPath('planner.shared-parental-leave'))
    }
  })

router
  .route(paths.getPath('planner.paternity-leave.start'))
  .get(function (req, res) {
    clearLaterLeaveBlockAnswers(req, 'secondary.initial.start')
    res.render('accessible-planner/paternity-leave-start')
  })
  .post(function (req, res) {
    const startData = delve(
      req.session.data,
      'leave-blocks.secondary.initial.start'
    )
    const updatedData = {
      initial: [
        {
          start: startData[0],
          end: parseInt(startData[0]) + 1,
          leave: 'paternity'
        },
        {
          start: startData[1],
          end: parseInt(startData[1]) + 1,
          leave: 'paternity'
        }
      ]
    }
    dset(
      req.session.data,
      'leave-blocks.secondary.initial',
      updatedData.initial
    )
    res.redirect(paths.getPath('planner.shared-parental-leave'))
  })

router
  .route(paths.getPath('planner.shared-parental-leave'))
  .get(function (req, res) {
    const leaveBlocks = parseLeaveBlocks(req.session.data['leave-blocks'])
    if (getRemainingLeaveAllowance(leaveBlocks) === 0) {
      req.session.data.visualPlanner = false
      res.redirect(paths.getPath('summary'))
    } else {
      clearCurrenttSplBlockIfIncomplete(req)
      res.render('accessible-planner/shared-parental-leave')
    }
  })
  .post(function (req, res) {
    if (!validate.splQuestions(req)) {
      return res.redirect(req.path)
    }
    const { data } = req.session
    const next = data['leave-blocks']['is-taking-spl-or-done']
    data['leave-blocks']['spl-block-planning-order'] =
      dataUtils.splBlockPlanningOrder(data) || []
    data['leave-blocks']['spl-block-planning-order'].push(next)
    if (next === 'done') {
      req.session.data.visualPlanner = false
      res.redirect(paths.getPath('summary'))
    } else {
      const parent = next
      const splBlockDataObject = delve(
        data,
        ['leave-blocks', parent, 'spl'],
        {}
      )
      const nextIndex = Object.keys(splBlockDataObject).length
      dset(
        data,
        ['leave-blocks', parent, 'spl', `_${nextIndex}`, 'leave'],
        'shared'
      )
      res.redirect(paths.getPath('planner.shared-parental-leave.start'))
    }
  })

router
  .route(paths.getPath('planner.shared-parental-leave.start'))
  .get(function (req, res) {
    clearLaterSplBlocks(req)
    clearCurrentSplBlockStart(req)
    clearCurrentSplBlockEnd(req)
    res.render('accessible-planner/shared-parental-leave-start')
  })
  .post(function (req, res) {
    res.redirect(paths.getPath('planner.shared-parental-leave.end'))
  })

router
  .route(paths.getPath('planner.shared-parental-leave.end'))
  .get(function (req, res) {
    clearLaterSplBlocks(req)
    clearCurrentSplBlockEnd(req)
    res.render('accessible-planner/shared-parental-leave-end')
  })
  .post(function (req, res) {
    res.redirect(paths.getPath('planner.shared-parental-leave'))
  })

router.route(paths.getPath('summary')).get(function (req, res) {
  const { leaveBlocks, payBlocks } = getBlocks(req.session.data)
  const shareToken = new ShareTokenEncoder(req.session.data).encode(1)
  req.session.timings = req.session.timings || { plannerStart: Date.now() }
  req.session.timings.plannerEnd = Date.now()
  const { plannerJourneyTime, totalJourneyTime } = getJourneyTime(
    req.session.timings
  )
  res.render('summary', {
    leaveBlocks,
    payBlocks,
    shareToken,
    plannerJourneyTime,
    totalJourneyTime
  })
})

router.route(paths.getPath('feedbackConfirmation')).get(function (req, res) {
  const referrer = req.header('Referrer')
  res.render('feedback/feedback-confirmation', { referrer })
})

router
  .route(paths.getPath('feedback'))
  .get(function (req, res) {
    const referrer = req.header('Referrer')
    res.render('feedback/feedback', { referrer })
  })
  .post(function (req, res) {
    if (!validate.feedback(req)) {
      logger.error({
        message: `Feedback form validation failed: ${JSON.stringify(req.body)}`,
        eventType: 'ValidationFailure',
        eventResult: 'ValidationFailure',
        EventSeverity: 'Medium'
      })
      return res.redirect(req.path)
    }
    const experience = req.body.feedback
    const moreDetail = req.body['feedback-more-detail']

    emailJSEmail(experience, moreDetail, emailjsIds, options, req.headers)
      .then(() => {
        res.redirect('/feedback/confirmation')
      })
      .catch((err) => {
        logger.error({
          message: `Error sending feedback email: ${err.message}`,
          eventType: 'MailEvent',
          eventResult: 'Failure',
          errorDetails: err.message
        })
        res.redirect('/feedback/confirmation')
      })
  })

router.route(paths.getPath('cookies')).get(function (req, res) {
  const referrer = req.header('Referrer')
  res.render('privacy/cookies', { referrer })
})

router.route(paths.getPath('accessibilityStatement')).get(function (req, res) {
  const referrer = req.header('Referrer')
  res.render('accessibility-statement', { referrer })
})

router.route(paths.getPath('privacyNotice'))
  .get(function (req, res) {
    const referrer = req.header('Referrer')
    res.render('privacy-notice', { referrer })
  })

module.exports = router
