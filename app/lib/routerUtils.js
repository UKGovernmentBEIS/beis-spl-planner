const _ = require('lodash')
const delve = require('dlv')
const dset = require('dset')
const paths = require('../paths')
const { isNo } = require('../../common/lib/dataUtils')
const Day = require('../../common/lib/day')
const { isYesOrNo } = require('./validationUtils')

function registerEligibilityRouteForPrimaryParents (router, endpoint, handlers) {
  registerRoutes(router, 'eligibility', ['mother', 'primary-adopter'], endpoint, handlers)
}

function registerPlannerRouteForPrimaryLeaveTypes (router, endpoint, handlers) {
  registerRoutes(router, 'planner', ['maternity-leave', 'adoption-leave'], endpoint, handlers)
}

function registerRoutes (router, path, subpaths, endpoint, handlers) {
  for (const subpath of subpaths) {
    const route = router.route(paths.getPath(`${path}.${subpath}.${endpoint}`))
    if (handlers.get) {
      route.get(handlers.get.bind(this))
    }
    if (handlers.post) {
      route.post(handlers.post.bind(this, subpath))
    }
  }
}

function getParent (parentUrlPart) {
  return parentUrlPart === 'partner' ? 'secondary' : 'primary'
}

function bothParentsAreIneligible (data) {
  const primarySplEligible = delve(data, ['primary', 'spl-eligible'])
  const primaryShppEligible = delve(data, ['primary', 'shpp-eligible'])
  const secondarySplEligible = delve(data, ['secondary', 'spl-eligible'])
  const secondaryShppEligible = delve(data, ['secondary', 'shpp-eligible'])
  return isNo(primarySplEligible) &&
         isNo(primaryShppEligible) &&
         isNo(secondarySplEligible) &&
         isNo(secondaryShppEligible)
}

function parseExternalQueryString (req) {
  ['primary', 'secondary'].forEach(parent => {
    ['spl', 'shpp'].forEach(policy => {
      const parentPolicyEligibility = req.query[`${parent}-${policy}-eligible`]
      if (isYesOrNo(parentPolicyEligibility)) {
        dset(req.session.data, `${parent}.${policy}-eligible`, parentPolicyEligibility)
      }
    })
  })
  req.session.data['nature-of-parenthood'] = req.query['nature-of-parenthood']
  const dueDate = new Day(req.query['due-date'])
  if (dueDate.isValid()) {
    req.session.data['start-date-day'] = dueDate.date()
    req.session.data['start-date-month'] = dueDate.monthOneIndexed()
    req.session.data['start-date-year'] = dueDate.year()
  }
}

const nonSplLeaveBlockFieldOrder = [
  'primary.initial.start',
  'primary.initial.leave',
  'primary.initial.end',
  'secondary.is-taking-paternity-leave',
  'secondary.initial.start',
  'secondary.initial.leave',
  'secondary.initial.end'
]

function clearLaterLeaveBlockAnswers (req, currentStep) {
  const { data } = req.session
  let hasReachedStep = false
  for (const field of nonSplLeaveBlockFieldOrder) {
    if (field === currentStep) {
      hasReachedStep = true
    }
    if (hasReachedStep) {
      safeDeleteKey(data, ['leave-blocks', ...field.split('.')])
    }
  }
  safeDeleteKey(data, 'leave-blocks.primary.spl')
  safeDeleteKey(data, 'leave-blocks.secondary.spl')
}

function clearLaterSplBlockAnswers (req, blockNumber) {
  blockNumber = parseInt(blockNumber)
  if (isNaN(blockNumber)) {
    return
  }
  const { data } = req.session
  const leaveBlocks = data['leave-blocks']
  const splPlanningOrder = _.castArray(delve(leaveBlocks, 'spl-block-planning-order', []))
  if (splPlanningOrder.length === 0) {
    return
  }

  while (splPlanningOrder.length > blockNumber) {
    const parent = splPlanningOrder.pop()
    if (!leaveBlocks[parent] || !leaveBlocks[parent].spl) {
      continue
    }
    const indexes = Object.keys(leaveBlocks[parent].spl).filter(key => /_\d+/.test(key)).map(key => parseInt(key.substring(1)))
    const maxIndex = Math.max(...indexes)
    safeDeleteKey(data, ['leave-blocks', parent, 'spl', `_${maxIndex}`])
  }

  dset(data, 'leave-blocks.spl-block-planning-order', splPlanningOrder)
}

function safeDeleteKey (object, path) {
  path = _.isArray(path) ? path : path.split('.')
  const keyToDelete = path.pop()
  const containingObject = delve(object, path)
  if (containingObject) {
    delete containingObject[keyToDelete]
  }
}

module.exports = {
  registerEligibilityRouteForPrimaryParents,
  registerPlannerRouteForPrimaryLeaveTypes,
  getParent,
  bothParentsAreIneligible,
  parseExternalQueryString,
  clearLaterLeaveBlockAnswers,
  clearLaterSplBlockAnswers
}
