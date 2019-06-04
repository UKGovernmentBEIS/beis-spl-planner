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
      const compulsory = parent === 'primary' && (i === 0 || i === 1)
      const disabled = compulsory || (parent === 'secondary' && i < 0)
      checkboxes.push({
        id: `${parent}-leave_${i}`,
        value: i,
        text: `Week ${i}`,
        checked: compulsory || leaveWeeks.includes(i),
        disabled: disabled,
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
                checked: compulsory || payWeeks.includes(i),
                disabled: disabled,
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

  function getStartDay (data) {
    return new Day(data['start-date-day'], data['start-date-month'], data['start-date-year']).startOfWeek()
  }

  function endOfWeek (day) {
    return day.endOfWeek()
  }

  return {
    weekCheckboxes,
    getStartDay,
    endOfWeek
  }
}
