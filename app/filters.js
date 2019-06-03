const { getWeeksArray } = require('./utils')

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

  return {
    weekCheckboxes
  }
}
