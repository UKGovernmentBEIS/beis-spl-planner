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
    weeklyPay: weeklyPay(data, parent)
  }
}

module.exports = {
  getWeeksArray,
  nameAndNonSharedLeaveType,
  parseParentFromPlanner
}

function weeklyPay (data, parent) {
  const providedSalary = parseFloat(data[`${parent}-salary-amount`])
  if (!providedSalary && providedSalary !== 0) {
    return
  }
  const period = data[`${parent}-salary-period`]
  switch (period) {
    case 'week':
      return providedSalary
    case 'month':
      return (providedSalary * 12) / 52
    case 'year':
      return providedSalary / 52
    default:
      return null
  }
}
