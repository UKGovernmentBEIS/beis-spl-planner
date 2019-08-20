const _ = require('lodash')
const delve = require('dlv')
const dset = require('dset')
const paths = require('../paths')
const dataUtils = require('../../common/lib/dataUtils')
const Day = require('../../common/lib/day')
const { isYesOrNo } = require('./validationUtils')

function registerEligibilityRouteForPrimaryParents (router, endpoint, handlers) {
  registerRoutes(router, 'eligibility', ['mother', 'primary-adopter', 'parental-order-parent'], endpoint, handlers)
}

function registerEligibilityRouteForBirthMother (router, endpoint, handlers) {
  registerRoutes(router, 'eligibility', ['mother'], endpoint, handlers)
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
  return dataUtils.isNo(primarySplEligible) &&
         dataUtils.isNo(primaryShppEligible) &&
         dataUtils.isNo(secondarySplEligible) &&
         dataUtils.isNo(secondaryShppEligible)
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
  safeDeleteKey(data, 'leave-blocks.spl-block-planning-order')
  safeDeleteKey(data, 'leave-blocks.primary.spl')
  safeDeleteKey(data, 'leave-blocks.secondary.spl')
}

function clearCurrenttSplBlockIfIncomplete (req) {
  clearDoneFromSplPlanningOrder(req)
  const { data } = req.session
  const splBlockPlanningOrder = dataUtils.splBlockPlanningOrder(data)
  const currentPlanned = splBlockPlanningOrder[splBlockPlanningOrder.length - 1]
  if (!currentPlanned) {
    return
  }
  const currentParent = currentPlanned
  const parentSplBlocks = delve(data, ['leave-blocks', currentParent, 'spl'], {})
  const numberOfBlocks = Object.keys(parentSplBlocks).length
  if (numberOfBlocks === 0) {
    return
  }
  const currentBlockIndex = `_${numberOfBlocks - 1}`
  const currentBlock = parentSplBlocks[currentBlockIndex]
  if (!currentBlock.start || !currentBlock.end) {
    // Remove incomplete block.
    splBlockPlanningOrder.pop()
    dset(data, 'leave-blocks.spl-block-planning-order', splBlockPlanningOrder)
    safeDeleteKey(data, ['leave-blocks', currentParent, 'spl', currentBlockIndex])
  }
}

function clearCurrentSplBlockStart (req) {
  clearDoneFromSplPlanningOrder(req)
  const currentBlock = getCurrentSplBlock(req.session.data)
  safeDeleteKey(currentBlock, 'start')
}

function clearCurrentSplBlockEnd (req) {
  clearDoneFromSplPlanningOrder(req)
  const currentBlock = getCurrentSplBlock(req.session.data)
  safeDeleteKey(currentBlock, 'end')
}

function clearDoneFromSplPlanningOrder (req) {
  const { data } = req.session
  const splBlockPlanningOrder = dataUtils.splBlockPlanningOrder(data)
  if (splBlockPlanningOrder[splBlockPlanningOrder.length - 1] === 'done') {
    splBlockPlanningOrder.pop()
    dset(data, 'leave-blocks.spl-block-planning-order', splBlockPlanningOrder)
  }
}

function getCurrentSplBlock (data) {
  const splBlockPlanningOrder = dataUtils.splBlockPlanningOrder(data)
  const currentParent = splBlockPlanningOrder[splBlockPlanningOrder.length - 1]
  const parentSplBlocks = delve(data, ['leave-blocks', currentParent, 'spl'], {})
  const numberOfBlocks = Object.keys(parentSplBlocks).length
  if (numberOfBlocks === 0) {
    return null
  }
  const currentBlockIndex = `_${numberOfBlocks - 1}`
  return parentSplBlocks[currentBlockIndex]
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
  registerEligibilityRouteForBirthMother,
  registerPlannerRouteForPrimaryLeaveTypes,
  getParent,
  bothParentsAreIneligible,
  parseExternalQueryString,
  clearLaterLeaveBlockAnswers,
  clearCurrenttSplBlockIfIncomplete,
  clearCurrentSplBlockStart,
  clearCurrentSplBlockEnd
}
