const { getWeeksArray } = require('./utils')
const Day = require('../common/lib/day')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  const isBirth = env.getFilter('isBirth')

  function weekCheckboxes (data, parent, govukCheckboxes) {
    const minWeek = isBirth(data) ? -11 : -2
    const checkboxes = []
    const leaveWeeks = getWeeksArray(data, parent, 'leave')
    const payWeeks = getWeeksArray(data, parent, 'pay')
    for (let i = minWeek; i <= 52; i++) {
      const compulsoryLeave = parent === 'primary' && (i === 0 || i === 1)
      const outOfRange = parent === 'secondary' && i < 0
      checkboxes.push({
        id: `${parent}-leave_${i}`,
        value: i,
        text: `Week ${i}`,
        checked: leaveWeeks.includes(i),
        disabled: compulsoryLeave || outOfRange,
        attributes: {
          'data-parent': parent,
          'data-property': 'leave'
        },
        conditional: {
          html: govukCheckboxes({
            name: parent + '[pay]',
            items: [
              {
                id: `${parent}-pay_${i}`,
                value: i,
                text: 'Paid',
                checked: payWeeks.includes(i),
                disabled: outOfRange,
                attributes: {
                  'data-parent': parent,
                  'data-property': 'pay'
                }
              }
            ]
          })
        }
      })
    }
    return checkboxes
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
    weekCheckboxes,
    hasStartDateError,
    startDay,
    startOfWeek,
    endOfWeek,
    startDateName,
    totalBlockPay
  }
}
