/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const Day = require('../common/lib/day')
const {
  buildError,
  prettyList
} = require('./lib/validationUtils')

function birthOrAdoption (req) {
  if (!['birth', 'adoption'].includes(req.session.data['birth-or-adoption'])) {
    req.session.errors = { 'birth-or-adoption': 'Select either birth or adoption' }
    return false
  }
  return true
}

function startDate (req) {
  function buildDateError (message, href, dateParts) {
    return Object.assign(buildError(message, href), { dateParts })
  }

  const date = {
    year: req.session.data['start-date-year'],
    month: req.session.data['start-date-month'],
    day: req.session.data['start-date-day']
  }

  if ([date.year, date.month, date.day].every(value => value === '')) {
    req.session.errors['start-date'] = [buildDateError('Enter a date', '#start-date-day', ['day', 'month', 'year'])]
    return false
  }

  if ([date.year, date.month, date.day].some(value => value === '')) {
    const errorParts = ['day', 'month', 'year'].filter(datePart => date[datePart] === '')
    req.session.errors['start-date'] = [buildDateError(`Date must include a ${prettyList(errorParts)}`, `#start-date-${errorParts[0]}`, errorParts)]
    return false
  }

  const startDate = new Day(date.year, date.month, date.day)

  if (!startDate.isValid()) {
    const errorParts = []
    if (startDate.invalidAt() === 2) { errorParts.push('day') }
    if (startDate.invalidAt() === 1) { errorParts.push('month') }
    if (startDate.invalidAt() === 0) { errorParts.push('year') }
    req.session.errors['start-date'] = [buildDateError('Enter a valid date', `#start-date-${errorParts[0]}`, errorParts)]
    return false
  }

  const earliestPermitted = new Day().subtract(1, 'year')
  const latestPermitted = new Day().add(1, 'year')
  if (!startDate.isBetween(earliestPermitted, latestPermitted)) {
    const errorMessage = 'Date must be within one year of today'
    req.session.errors['start-date'] = [buildDateError(errorMessage, '#start-date-day', ['day', 'month', 'year'])]
    return false
  }
  return true
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
    req.session.errors['parent-salaries'].push(buildError('Enter a valid salary', '#primary-salary-amount'))
  }

  if (secondarySalary && !secondarySalary.match(/[0-9]+(\.[0-9]{1,2})?/)) {
    req.session.errors['parent-salaries'].push(buildError('Enter a valid salary', '#secondary-salary-amount'))
  }

  if (primaryPeriod && !['year', 'month', 'week'].includes(primaryPeriod)) {
    req.session.errors['parent-salaries'].push(buildError('Provide a valid salary period', '#primary-salary-period'))
  }

  if (primaryPeriod && !['year', 'month', 'week'].includes(secondaryPeriod)) {
    req.session.errors['parent-salaries'].push(buildError('Provide a valid salary period', '#secondary-salary-period'))
  }

  return !req.session.errors['parent-salaries'].length
}

module.exports = {
  birthOrAdoption,
  startDate,
  parentSalaries
}

module.exports = {}
