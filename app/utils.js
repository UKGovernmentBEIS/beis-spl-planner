const dlv = require('dlv')
const _ = require('lodash')

const MOTHER = Object.freeze({
  name: 'mother',
  nonSharedLeaveType: 'maternity'
})

const PRIMARY_ADOPTER = Object.freeze({
  name: 'primary adopter',
  nonSharedLeaveType: 'adoption'
})

const PARTNER = Object.freeze({
  name: 'partner',
  nonSharedLeaveType: 'paternity'
})

function getWeeksArray (data, parent, property) {
  return _.castArray(dlv(data, [parent, property], [])).map(i => parseInt(i))
}

function nameAndNonSharedLeaveType (data, parent) {
  if (parent === 'secondary') {
    return PARTNER
  } else if (data['birth-or-adoption'] === 'birth') {
    return MOTHER
  } else {
    return PRIMARY_ADOPTER
  }
}

function parseParentFromPlanner (data, parent) {
  return {
    leaveWeeks: getWeeksArray(data, parent, 'leave'),
    payWeeks: getWeeksArray(data, parent, 'pay'),
    // TODO: Get weekly pay from data.
    weeklyPay: parent === 'primary' ? 1000 : null
  }
}

module.exports = {
  getWeeksArray,
  nameAndNonSharedLeaveType,
  parseParentFromPlanner
}
