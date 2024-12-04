/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const delve = require('dlv')
const _ = require('lodash')
const Day = require('../common/lib/day')
const skip = require('./skip')
const { parseParentFromPlanner, parseStartDay, parseWeeksFromData } = require('./utils')
const dataUtils = require('../common/lib/dataUtils')
const {
  prettyList,
  addError,
  validateParentYesNoFields,
  isYesOrNo
} = require('./lib/validationUtils')

function natureOfParenthood (req) {
  const acceptedValues = ['birth', 'adoption', 'surrogacy']
  if (!acceptedValues.includes(req.session.data['nature-of-parenthood'])) {
    addError(req, 'nature-of-parenthood', 'Select either birth, adoption or surrogacy', '#nature-of-parenthood')
    return false
  }
  return true
}

function typeOfAdoption (req) {
  if (skip.typeOfAdoption(req)) {
    return true
  }
  const acceptedValues = ['uk', 'overseas']
  if (!acceptedValues.includes(req.session.data['type-of-adoption'])) {
    addError(req, 'type-of-adoption', 'Select either UK or overseas adoption', '#type-of-adoption')
    return false
  }
  return true
}

function primarySharedParentalLeaveAndPay (req) {
  return validateParentYesNoFields(req, 'primary', {
    'spl-eligible': 'Select whether you are eligible for Shared Parental Leave',
    'shpp-eligible': 'Select whether you are eligible for Shared Parental Pay'
  })
}

function initialLeaveAndPay (req) {
  let isValid = true
  const { primary } = req.session.data
  if (dataUtils.isNo(primary['spl-eligible']) && !isYesOrNo(primary['initial-leave-eligible'])) {
    addError(req, 'initial-leave-eligible', 'Select whether you are eligible for leave', '#primary-initial-leave-eligible')
    isValid = false
  }
  if (dataUtils.isNo(primary['shpp-eligible']) && !isYesOrNo(primary['initial-pay-eligible'])) {
    addError(req, 'initial-pay-eligible', 'Select whether you are eligible for pay', '#primary-initial-pay-eligible')
    isValid = false
  }
  return isValid
}

function maternityAllowance (req) {
  if (skip.maternityAllowance(req)) {
    return true
  }
  if (!isYesOrNo(delve(req.session.data, ['primary', 'maternity-allowance-eligible']))) {
    addError(req, 'maternity-allowance-eligible', 'Select whether you are eligible for Maternity Allowance', '#maternity-allowance-eligible')
    return false
  }
  return true
}

function secondarySharedParentalLeaveAndPay (req) {
  return validateParentYesNoFields(req, 'secondary', {
    'spl-eligible': 'Select whether you are eligible for Shared Parental Leave',
    'shpp-eligible': 'Select whether you are eligible for Shared Parental Pay'
  })
}

function paternityLeaveAndPay (req) {
  let isValid = true
  const { secondary } = req.session.data
  if (dataUtils.isNo(secondary['spl-eligible']) && !isYesOrNo(secondary['initial-leave-eligible'])) {
    addError(req, 'initial-leave-eligible', 'Select whether you are eligible for leave', '#initial-leave-eligible')
    isValid = false
  }
  if (dataUtils.isNo(secondary['shpp-eligible']) && !isYesOrNo(secondary['initial-pay-eligible'])) {
    addError(req, 'initial-pay-eligible', 'Select whether you are eligible for pay', '#initial-pay-eligible')
    isValid = false
  }
  return isValid
}

function startDate (req) {
  const date = {
    year: req.session.data['start-date-year'],
    month: req.session.data['start-date-month'],
    day: req.session.data['start-date-day']
  }

  const allParts = ['day', 'month', 'year']

  const emptyParts = allParts.filter(datePart => date[datePart] === '')
  if (emptyParts.length > 0) {
    addStartDateError(req, `Enter a valid ${prettyList(emptyParts)}`, emptyParts)
    return false
  }

  const startDate = new Day(date.year, date.month, date.day)
  if (!startDate.isValid()) {
    const invalidIndex = startDate.invalidAt()
    const invalidPart = ['year', 'month', 'day'][invalidIndex]
    if (invalidPart) {
      addStartDateError(req, `Enter a valid ${invalidPart}`, [invalidPart])
    } else {
      addStartDateError(req, 'Enter a valid date', allParts)
    }
    return false
  }

  const earliestPermitted = new Day().subtract(1, 'year')
  const latestPermitted = new Day().add(1, 'year')
  if (!startDate.isBetween(earliestPermitted, latestPermitted)) {
    addStartDateError(req, 'Enter a date within one year of today', allParts)
    return false
  }

  return true
}

function feedback (req) {
  let valid = true
  if (!req.session.data.feedback) {
    addError(req, 'feedback', 'Provide your experience with the service.', '#feedback')
    valid = false
  }

  if (req.session.data.url) {
    valid = false
  }

  const value = req.session.data['spam-filter'].toLowerCase()
  if (!value.length) {
    addError(req, 'spam-filter', 'Prove you are not a robot.', '#spam-filter')
    valid = false
  } else if (value !== 'yes' && value !== 'yes.') {
    addError(req, 'spam-filter', 'The value you entered was incorrect. Please try again.', '#spam-filter')
    valid = false
  }

  return valid
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
  const isBirth = dataUtils.isBirth(data)
  const isUkAdoption = dataUtils.isUkAdoption(data)
  const isOverseasAdoption = dataUtils.isOverseasAdoption(data)
  const isSurrogacy = dataUtils.isSurrogacy(data)
  const birthOrPlacement = dataUtils.birthOrPlacement(data)
  const startWeek = parseStartDay(req.session.data)
  const inputWeeks = {
    primary: parseParentFromPlanner(data, 'primary'),
    secondary: parseParentFromPlanner(data, 'secondary')
  }
  const names = {
    primary: dataUtils.parentName(data, 'primary'),
    secondary: dataUtils.parentName(data, 'secondary')
  }

  const weeks = parseWeeksFromData(data).leaveAndPay().weeks

  // Pay without leave.
  for (const [parent, leaveAndPay] of Object.entries(inputWeeks)) {
    const payWithoutLeaveWeeks = leaveAndPay.payWeeks.filter(week => !leaveAndPay.leaveWeeks.includes(week))
    if (payWithoutLeaveWeeks.length > 0) {
      const weeks = payWithoutLeaveWeeks.map(week => startWeek.add(week, 'weeks').format('D MMMM')).join(', ')
      const message = `The ${names[parent]} has taken pay without leave on the following weeks: ${weeks}. Correct these weeks by selecting leave or unselecting pay.`
      addCalendarError(req, parent, 'pay-without-leave', message)
      isValid = false
    }
  }

  // Initial leave rules.
  if (isBirth) {
    // Maternity Leave rules.
    const lastCompulsoryLeaveWeek = 1
    const compulsoryLeaveWeeks = _.range(0, lastCompulsoryLeaveWeek + 1)

    // Leave or pay break before end of compulsory leave.
    for (const policy of ['leave', 'pay']) {
      const weeks = inputWeeks.primary[policy + 'Weeks']
      if (hasBreakBeforeEnd(weeks, lastCompulsoryLeaveWeek)) {
        const message = `The ${names.primary} cannot have a break in their ${policy} before the end of compulsory leave.`
        addCalendarError(req, 'primary', `${policy}-break-before-end-of-compulsory-leave`, message)
        isValid = false
      }
    }

    // Not taking compulsory leave.
    if (compulsoryLeaveWeeks.some(week => !inputWeeks.primary.leaveWeeks.includes(week))) {
      const message = `The ${names.primary} must take 2 weeks of Maternity Leave and/or Pay when the child is born.`
      addCalendarError(req, 'primary', 'not-taking-compulsory-leave', message)
      isValid = false
    }
  } else {
    // Adoption Leave rules.
    const firstPrimaryLeaveWeek = inputWeeks.primary.leaveWeeks[0]
    const secondPrimaryLeaveWeek = inputWeeks.primary.leaveWeeks[1]

    // Not taking 2 weeks of Adoption Leave.
    if (secondPrimaryLeaveWeek - firstPrimaryLeaveWeek !== 1) {
      const message = `The ${names.primary} must take 2 weeks of Adoption Leave or Pay to create SPL eligiblity.`
      addCalendarError(req, 'primary', 'not-taking-enough-adoption-leave', message)
      isValid = false
    }

    // Not taking Adoption Leave at the correct time.
    if ((isUkAdoption || isSurrogacy) && !inputWeeks.primary.leaveWeeks.includes(0)) {
      const message = `The ${names.primary} must take the first week after ${birthOrPlacement} as Adoption Leave or Pay.`
      addCalendarError(req, 'primary', 'not-taking-first-week-of-adoption-leave', message)
      isValid = false
    } else if (isOverseasAdoption && (firstPrimaryLeaveWeek > 3)) {
      const message = `The ${names.primary} must take their first week of Adoption Leave or Pay within 28 days of the child arriving in the UK.`
      addCalendarError(req, 'primary', 'not-taking-overseas-adoption-leave-in-first-28-days', message)
      isValid = false
    }
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
      const dateExplanation = (earliestWeek === 0) ? `the ${birthOrPlacement} week` : `${Math.abs(earliestWeek)} before ${birthOrPlacement}`
      const message = `The ${names[parent]} cannot take leave or pay before ${earliestDate} (${dateExplanation}).`
      addCalendarError(req, parent, 'too-early', message)
      isValid = false
    }
    if (_.max(weeks) > 52) {
      const latestDate = startWeek.add(52, 'weeks').format('D MMMM')
      const message = `The ${names[parent]} cannot take leave or pay after ${latestDate} (one year after ${birthOrPlacement}).`
      addCalendarError(req, parent, 'too-late', message)
      isValid = false
    }
  }

  // Too many Paternity Leave weeks.
  const paternityLeaveAllowanceUsed = getLeaveWeeksCount(weeks, ['paternity'])
  if (paternityLeaveAllowanceUsed > 2) {
    const overspend = paternityLeaveAllowanceUsed - 2
    const message = `You’ve taken too many weeks of Paternity Leave. Unselect ${overspend} Paternity Leave week${overspend > 1 ? 's' : ''}.`
    addCalendarError(req, 'secondary', 'too-many-paternity-leave-weeks', message)
    isValid = false
  }

  // Too many shared leave weeks.
  const sharedLeaveAllowanceUsed = getLeaveWeeksCount(weeks, ['shared', 'maternity', 'adoption'])
  if (sharedLeaveAllowanceUsed > 52) {
    const overspend = sharedLeaveAllowanceUsed - 52
    const message = `You’ve taken too many weeks of leave. Unselect ${overspend} leave week${overspend > 1 ? 's' : ''}.`
    addCalendarError(req, 'shared', 'too-many-leave-weeks', message)
    isValid = false
  }

  // Too many shared pay weeks.
  const sharedPayAllowanceUsed = getPayWeeksCount(weeks, ['shared', 'maternity', 'adoption'])
  if (sharedPayAllowanceUsed > 39) {
    const overspend = sharedPayAllowanceUsed - 39
    const message = `You’ve taken too many weeks of pay. Untick ${overspend} pay week${overspend > 1 ? 's' : ''}.`
    addCalendarError(req, 'shared', 'too-many-pay-weeks', message)
    isValid = false
  }

  return isValid
}

function hasBreakBeforeEnd (weeks, end) {
  weeks = weeks.sort((a, b) => a - b)
  let previousWeek = null
  for (const week of weeks) {
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

function getLeaveWeeksCount (weeks, types) {
  return weeks.reduce((count, week) => {
    for (const parent of ['primary', 'secondary']) {
      const { leave } = week[parent]
      if (leave.eligible && types.includes(leave.text)) {
        count++
      }
    }
    return count
  }, 0)
}

function getPayWeeksCount (weeks, types) {
  return weeks.reduce((count, week) => {
    for (const parent of ['primary', 'secondary']) {
      const { leave, pay } = week[parent]
      if (types.includes(leave.text) && pay.eligible && !!pay.text) {
        count++
      }
    }
    return count
  }, 0)
}

function addCalendarError (req, parentOrShared, key, message) {
  addError(req, `calendar.${parentOrShared}.${key}`, message, '#leave-and-pay')
}

function paternityLeaveQuestion (req) {
  const secondaryLeaves = req.session.data['leave-blocks'].secondary
  if (typeof secondaryLeaves === 'undefined' || !isYesOrNo(secondaryLeaves['is-taking-paternity-leave'])) {
    addError(req, 'is-taking-paternity-leave', ' Select whether or not the Partner will take Paternity Leave', '#is-taking-paternity-leave')
    return false
  }
  return true
}

function splQuestions (req) {
  const leaves = req.session.data['leave-blocks']
  if (typeof leaves['is-taking-spl-or-done'] === 'undefined') {
    addError(req, 'shared-parental-leave', 'Select whether you want to take Shared Parental Leave or finish', '#shared-parental-leave')
    return false
  }
  return true
}

module.exports = {
  natureOfParenthood,
  typeOfAdoption,
  primarySharedParentalLeaveAndPay,
  initialLeaveAndPay,
  maternityAllowance,
  secondarySharedParentalLeaveAndPay,
  paternityLeaveAndPay,
  startDate,
  addStartDateError,
  parentSalaries,
  planner,
  paternityLeaveQuestion,
  splQuestions,
  feedback,
  hasBreakBeforeEnd,
  getLeaveWeeksCount,
  getPayWeeksCount,
  addCalendarError
}
