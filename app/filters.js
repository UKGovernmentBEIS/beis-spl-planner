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

  function startDay (data) {
    return new Day(data['start-date-year'], data['start-date-month'], data['start-date-day']).startOfWeek()
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

  function formTemplate(text, options) {
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

    return text
      .replace(/\$parentOrPartner/g, options.parentOrPartner)
      .replace(/\$parent/g, options.parent)
      .replace(/\$Parent/g, capitalize(options.parent))
      .replace(/\$other/g, options.otherParent)
      .replace(/\$Other/g, capitalize(options.otherParent))
      .replace(/\$state/g, options.state)
      .replace(/\$State/g, capitalize(options.state))
      .replace(/\$count/g, options.sectionCount)
      .replace(/\$youintend/g, options.youIntendLabel)
      .replace(/\$partnerintends/g, options.partnerIntendsLabel)
      .replace(/\$leaveabbr/g, options.leaveAbbreviation)
      .replace(/\$payabbr/g, options.payAbbreviation)
      .replace(/\$her/g, options.her)
      .replace(/\$event/g, options.event)
      .replace(/\$father/g, options.father);
  }

  function getTotalWeeksOfSPL(blocks) {
    return blocks.spl.reduce((total, block) => total + block.end - block.start + 1, 0);
  }

  return {
    formTemplate,
    weekCheckboxes,
    startDay,
    startOfWeek,
    endOfWeek,
    startDateName,
    getTotalWeeksOfSPL
  }
}
