/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const delve = require('dlv')
const Day = require('../common/lib/day')
const skip = require('./skip')
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
  if (skip.initialLeaveAndPay(req)) {
    return true
  }
  return validateParentYesNoFields(req, 'primary', {
    'initial-leave-eligible': 'Select whether you are eligible for leave',
    'initial-pay-eligible': 'Select whether you are eligible for pay'
  })
}

function maternityAllowance (req) {
  if (skip.maternityAllowance(req)) {
    return true
  }
  if (req.session.data['birth-or-adoption'] === 'adoption') {
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
  return validateParentYesNoFields(req, 'secondary', {
    'initial-leave-eligible': 'Select whether you are eligible for leave',
    'initial-pay-eligible': 'Select whether you are eligible for pay'
  })
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
  let isValid = true
  const {
    'salary-amount': primarySalary,
    'salary-period': primaryPeriod
  } = req.session.data.primary
  const {
    'salary-amount': secondarySalary,
    'salary-period': secondaryPeriod
  } = req.session.data.secondary

  if (primarySalary && !primarySalary.match(/[0-9]+(\.[0-9]{1,2})?/)) {
    addError(req, 'primary-salary-amount', 'Salary must be an amount of money like 23000 or 139.45', '#primary-salary-amount')
    isValid = false
  }

  if (secondarySalary && !secondarySalary.match(/[0-9]+(\.[0-9]{1,2})?/)) {
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

module.exports = {
  birthOrAdoption,
  primarySharedParentalLeaveAndPay,
  initialLeaveAndPay,
  maternityAllowance,
  secondarySharedParentalLeaveAndPay,
  paternityLeaveAndPay,
  startDate,
  parentSalaries
}
