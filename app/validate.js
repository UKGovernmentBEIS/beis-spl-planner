/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const delve = require('dlv')
const _ = require('lodash')
const Day = require('../common/lib/day')
const { isAdoption } = require('../common/lib/dataUtils')
const skip = require('./skip')
const { parseParentFromPlanner, parseStartDay } = require('./utils')
const dataUtils = require('../common/lib/dataUtils')
const {
  prettyList,
  addError,
  validateParentYesNoFields,
  isYesOrNo
} = require('./lib/validationUtils')

function birthOrAdoption (req) {
  if (!['birth', 'adoption'].includes(req.session.data['birth-or-adoption'])) {
    addError(req, 'birth-or-adoption', 'Select either birth or adoption', '#birth-or-adoption-1')
    return false
  }
  return true
}

function primarySharedParentalLeaveAndPay (req) {
  return validateParentYesNoFields(req, 'primary', {
    'spl-eligible': 'Select whether you are eligible for shared parental leave',
    'shpp-eligible': 'Select whether you are eligible for shared parental pay'
  })
}

function initialLeaveAndPay (req) {
  let isValid = true
  const { primary } = req.session.data
  if (dataUtils.isNo(primary['spl-eligible']) && !isYesOrNo(primary['initial-leave-eligible'])) {
    addError(req, 'initial-leave-eligible', 'Select whether you are eligible for leave', '#initial-leave-eligible-1')
    isValid = false
  }
  if (dataUtils.isNo(primary['shpp-eligible']) && !isYesOrNo(primary['initial-pay-eligible'])) {
    addError(req, 'initial-pay-eligible', 'Select whether you are eligible for pay', '#initial-pay-eligible-1')
    isValid = false
  }
  return isValid
}

function maternityAllowance (req) {
  if (skip.maternityAllowance(req)) {
    return true
  }
  if (isAdoption(req.session.data)) {
    return true
  }
  if (!isYesOrNo(delve(req.session.data, ['primary', 'maternity-allowance-eligible']))) {
    addError(req, 'maternity-allowance-eligible', 'Select whether you are eligible for maternity allowance', '#maternity-allowance-eligible-1')
    return false
  }
  return true
}

function secondarySharedParentalLeaveAndPay (req) {
  return validateParentYesNoFields(req, 'secondary', {
    'spl-eligible': 'Select whether you are eligible for shared parental leave',
    'shpp-eligible': 'Select whether you are eligible for shared parental pay'
  })
}

function paternityLeaveAndPay (req) {
  let isValid = true
  const { secondary } = req.session.data
  if (dataUtils.isNo(secondary['spl-eligible']) && !isYesOrNo(secondary['initial-leave-eligible'])) {
    addError(req, 'initial-leave-eligible', 'Select whether you are eligible for leave', '#initial-leave-eligible-1')
    isValid = false
  }
  if (dataUtils.isNo(secondary['shpp-eligible']) && !isYesOrNo(secondary['initial-pay-eligible'])) {
    addError(req, 'initial-pay-eligible', 'Select whether you are eligible for pay', '#initial-pay-eligible-1')
    isValid = false
  }
  return isValid
}

function startDate (req) {
  req.session.errors = {}

  const date = {
    year: req.session.data['start-date-year'],
    month: req.session.data['start-date-month'],
    day: req.session.data['start-date-day']
  }

  if (Object.values(date).every(value => value === '')) {
    addStartDateError(req, 'Enter a date', ['day', 'month', 'year'])
    return false
  }

  if (Object.values(date).some(value => value === '')) {
    const errorParts = ['day', 'month', 'year'].filter(datePart => date[datePart] === '')
    addStartDateError(req, `Date must include a ${prettyList(errorParts)}`, errorParts)
    return false
  }

  const startDate = new Day(date.year, date.month, date.day)
  if (!startDate.isValid()) {
    const invalidIndex = startDate.invalidAt()
    const invalidPart = ['year', 'month', 'day'][invalidIndex]
    addStartDateError(req, 'Enter a valid date', [invalidPart])
    return false
  }

  const earliestPermitted = new Day().subtract(1, 'year')
  const latestPermitted = new Day().add(1, 'year')
  if (!startDate.isBetween(earliestPermitted, latestPermitted)) {
    addStartDateError(req, 'Date must be within one year of today', ['day', 'month', 'year'])
    return false
  }
  return true
}

function addStartDateError (req, message, dateParts) {
  const href = `#start-date-${dateParts[0]}`
  addError(req, 'start-date', message, href, { dateParts })
}

function parentSalaries (req) {
  const {
    'salary-amount': primarySalary,
    'salary-period': primaryPeriod
  } = req.session.data.primary || {}
  const {
    'salary-amount': secondarySalary,
    'salary-period': secondaryPeriod
  } = req.session.data.secondary || {}

  if (req.method === 'POST' && !primarySalary && !secondarySalary) {
    addError(req, 'skip-this-question', "If you do not want to submit either parent’s salary, click 'Skip this question'", '#skip-this-question')
    return false
  }

  let isValid = true
  const validSalary = /^[0-9]+(\.[0-9]{1,2})?\s*$/

  if (primarySalary && !validSalary.test(primarySalary)) {
    addError(req, 'primary-salary-amount', 'Salary must be an amount of money like 23000 or 139.45', '#primary-salary-amount')
    isValid = false
  }

  if (secondarySalary && !validSalary.test(secondarySalary)) {
    addError(req, 'secondary-salary-amount', 'Salary must be an amount of money like 23000 or 139.45', '#secondary-salary-amount')
    isValid = false
  }

  if (primaryPeriod && !['year', 'month', 'week'].includes(primaryPeriod)) {
    addError(req, 'primary-salary-period', 'Salary period must be week, month or year', '#primary-salary-period')
    isValid = false
  }

  if (secondaryPeriod && !['year', 'month', 'week'].includes(secondaryPeriod)) {
    addError(req, 'secondary-salary-period', 'Salary period must be week, month or year', '#secondary-salary-period')
    isValid = false
  }

  return isValid
}

function planner (req) {
  let isValid = true

  const { data } = req.session
  const startWeek = parseStartDay(req.session.data)
  const inputWeeks = {
    primary: parseParentFromPlanner(data, 'primary'),
    secondary: parseParentFromPlanner(data, 'secondary')
  }
  const names = {
    primary: dataUtils.parentName(data, 'primary'),
    secondary: dataUtils.parentName(data, 'secondary')
  }

  // No interaction.
  if (inputWeeks.primary.leaveWeeks.length === 2 && inputWeeks.secondary.leaveWeeks.length === 0) {
    addCalendarError(req, 'shared', 'no-interaction', 'You have not added any leave to the calendar.')
    isValid = false
  }

  // Too many leave or pay weeks.
  const sharedAllowances = { leave: 52, pay: 39 }
  const paternityWeeks = getPaternityWeeks(inputWeeks.secondary)
  for (let [policy, allowance] of Object.entries(sharedAllowances)) {
    const weeksKey = `${policy}Weeks`
    const totalWeeks = inputWeeks.primary[weeksKey].length + inputWeeks.secondary[weeksKey].length - paternityWeeks[weeksKey].length
    if (totalWeeks > allowance) {
      const overspend = totalWeeks - allowance
      const message = `You’ve taken too many weeks of ${policy}. Deselect ${overspend} week${overspend > 1 ? 's' : ''}.`
      addCalendarError(req, 'shared', `too-many-${policy}-weeks`, message)
      isValid = false
    }
  }

  // Pay without leave.
  for (const [parent, leaveAndPay] of Object.entries(inputWeeks)) {
    const payWithoutLeaveWeeks = leaveAndPay.payWeeks.filter(week => !leaveAndPay.leaveWeeks.includes(week))
    if (payWithoutLeaveWeeks.length > 0) {
      const weeks = payWithoutLeaveWeeks.map(week => startWeek.add(week, 'weeks').format('D MMMM')).join(', ')
      const message = `The ${names[parent]} has taken leave without pay on the following weeks: ${weeks}. Correct these weeks by checking leave or unchecking pay.`
      addCalendarError(req, parent, 'pay-without-leave', message)
      isValid = false
    }
  }

  // Initial maternity / adoption rules.
  const lastCompulsoryLeaveWeek = 1
  const compulsoryLeaveWeeks = _.range(0, lastCompulsoryLeaveWeek + 1)

  // Leave or pay break before end of compulsory leave.
  for (const policy of ['leave', 'pay']) {
    const weeks = inputWeeks.primary[policy + 'Weeks']
    if (hasBreakBeforeEnd(weeks, lastCompulsoryLeaveWeek)) {
      const message = `The ${names.primary} cannot take a break in their ${policy} before the end of compulsory leave.`
      addCalendarError(req, 'primary', `${policy}-break-before-end-of-compulsory-leave`, message)
      isValid = false
    }
  }

  // Not taking compulsory leave.
  if (compulsoryLeaveWeeks.some(week => !inputWeeks.primary.leaveWeeks.includes(week))) {
    const message = 'It is cumpolsory to take leave in the first two weeks.'
    addCalendarError(req, 'primary', 'not-taking-compulsory-leave', message)
    isValid = false
  }

  // Too early or late.
  const earliestWeeks = {
    primary: dataUtils.earliestPrimaryLeaveWeek(data),
    secondary: 0
  }
  for (const [parent, earliestWeek] of Object.entries(earliestWeeks)) {
    const weeks = [...inputWeeks[parent].leaveWeeks, ...inputWeeks[parent].payWeeks]
    if (_.min(weeks) < earliestWeek) {
      const earliestDate = startWeek.add(earliestWeek, 'weeks').format('D MMMM')
      const message = `The ${names[parent]} cannot take leave or pay before ${earliestDate}.`
      addCalendarError(req, parent, 'too-early', message)
      isValid = false
    }
    if (_.max(weeks) > 52) {
      const latestDate = startWeek.add(52, 'weeks').format('D MMMM')
      const message = `The ${names[parent]} cannot take leave or pay after ${latestDate}.`
      addCalendarError(req, parent, 'too-late', message)
      isValid = false
    }
  }

  return isValid
}

function getPaternityWeeks (weeks) {
  const leaveWeeks = getPaternityLeaveWeeks(weeks)
  const payWeeks = leaveWeeks.filter(week => weeks.payWeeks.includes(week))
  return { leaveWeeks, payWeeks }
}

function getPaternityLeaveWeeks (weeks) {
  const eligibleLeaveWeeks = weeks.leaveWeeks.filter(week => week >= 0 && week < 8)
  if (eligibleLeaveWeeks.length < 2) {
    return eligibleLeaveWeeks
  } else {
    const firstTwoWeeksAreConsecutive = eligibleLeaveWeeks[1] - eligibleLeaveWeeks[0] === 1
    return firstTwoWeeksAreConsecutive ? eligibleLeaveWeeks.slice(0, 2) : eligibleLeaveWeeks.slice(0, 1)
  }
}

function hasBreakBeforeEnd (weeks, end) {
  weeks = weeks.sort((a, b) => a - b)
  let previousWeek = null
  for (let week of weeks) {
    if (week > end) {
      return false
    }
    if (previousWeek && (week - previousWeek !== 1)) {
      return true
    }
    previousWeek = week
  }
  return false
}

function addCalendarError (req, parentOrShared, key, message) {
  addError(req, `calendar.${parentOrShared}.${key}`, message, '#leave-and-pay')
}

module.exports = {
  birthOrAdoption,
  primarySharedParentalLeaveAndPay,
  initialLeaveAndPay,
  maternityAllowance,
  secondarySharedParentalLeaveAndPay,
  paternityLeaveAndPay,
  startDate,
  parentSalaries,
  planner
}
