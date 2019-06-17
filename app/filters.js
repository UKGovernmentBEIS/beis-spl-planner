const { getWeeksArray } = require('./utils')
const Day = require('../common/lib/day')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  const isBirth = env.getFilter('isBirth')

  function isWeekChecked (data, parent, property, week) {
    return getWeeksArray(data, parent, property).includes(week)
  }

  function hasStartDateError (errors, partOfDate) {
    return errors && errors['start-date'] && errors['start-date'].dateParts.includes(partOfDate)
  }

  function startDay (data) {
    return new Day(data['start-date-year'], data['start-date-month'], data['start-date-day'])
  }

  function startOfWeek (day) {
    return day.startOfWeek()
  }

  function endOfWeek (day) {
    return day.endOfWeek()
  }

  function startDateName (data) {
    return isBirth(data) ? 'due date' : 'placement date'
  }

  function totalBlockPay (block) {
    const primaryPay = block.primary && parseFloat(block.primary.substring(1))
    const secondaryPay = block.secondary && parseFloat(block.secondary.substring(1))
    return '£' + ((primaryPay || 0) + (secondaryPay || 0)).toFixed(2)
  }

  return {
    hasStartDateError,
    isWeekChecked,
    startDay,
    startOfWeek,
    endOfWeek,
    startDateName,
    totalBlockPay
  }
}
