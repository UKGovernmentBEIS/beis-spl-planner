/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const Day = require('../common/lib/day')
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

function primaryInitialLeaveAndPay (req) {
  return validateParentYesNoFields(req, 'primary', {
    'initial-leave-eligible': 'Select whether you are eligible for leave',
    'initial-pay-eligible': 'Select whether you are eligible for pay'
  })
}

function maternityAllowance (req) {
  if (!isYesOrNo(req.session.data['maternity-allowance-eligible'])) {
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
  req.session.errors['parent-salaries'] = []
  const {
    'primary-salary-amount': primarySalary,
    'secondary-salary-amount': secondarySalary,
    'primary-salary-period': primaryPeriod,
    'secondary-salary-period': secondaryPeriod
  } = req.session.data

  if (primarySalary && !primarySalary.match(/[0-9]+(\.[0-9]{1,2})?/)) {
    // req.session.errors['parent-salaries'].push(buildError('Enter a valid salary', '#primary-salary-amount'))
  }

  if (secondarySalary && !secondarySalary.match(/[0-9]+(\.[0-9]{1,2})?/)) {
    // req.session.errors['parent-salaries'].push(buildError('Enter a valid salary', '#secondary-salary-amount'))
  }

  if (primaryPeriod && !['year', 'month', 'week'].includes(primaryPeriod)) {
    // req.session.errors['parent-salaries'].push(buildError('Provide a valid salary period', '#primary-salary-period'))
  }

  if (primaryPeriod && !['year', 'month', 'week'].includes(secondaryPeriod)) {
    // req.session.errors['parent-salaries'].push(buildError('Provide a valid salary period', '#secondary-salary-period'))
  }

  return !req.session.errors['parent-salaries'].length
}

module.exports = {
  birthOrAdoption,
  primarySharedParentalLeaveAndPay,
  primaryInitialLeaveAndPay,
  maternityAllowance,
  secondarySharedParentalLeaveAndPay,
  paternityLeaveAndPay,
  startDate,
  parentSalaries
}
