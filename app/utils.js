const dlv = require('dlv')
const _ = require('lodash')
const Weeks = require('./lib/weeks')
const Day = require('../common/lib/day')
const { isBirth, natureOfParenthood } = require('../common/lib/dataUtils')
const { parseEligibilityFromData } = require('./lib/eligibility')

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
  } else if (isBirth(data)) {
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

function parseStartDay (data) {
  const {
    'start-date-year': year,
    'start-date-month': month,
    'start-date-day': day
  } = data
  return new Day(year, month, day)
}

function parseWeeksFromData (data) {
  return new Weeks({
    natureOfParenthood: natureOfParenthood(data),
    startWeek: parseStartDay(data),
    primary: parseParentFromPlanner(data, 'primary'),
    secondary: parseParentFromPlanner(data, 'secondary'),
    eligibility: parseEligibilityFromData(data)
  })
}

module.exports = {
  getWeeksArray,
  nameAndNonSharedLeaveType,
  parseParentFromPlanner,
  parseStartDay,
  parseWeeksFromData
}

function weeklyPay (data, parent) {
  const providedSalary = parseFloat(dlv(data, [parent, 'salary-amount']))
  if (isNaN(providedSalary)) {
    return null
  }
  const period = dlv(data, [parent, 'salary-period'])
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
