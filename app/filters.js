const { getWeeksArray, parseWeeksFromData } = require('./utils')
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

  function shouldDisplayPrimaryLeaveAndPayForm (data) {
    return parseWeeksFromData(data).hasPrimarySharedPayOrLeave()
  }

  function shouldDisplayPrimaryCurtailmentForm (data) {
    const weeks = parseWeeksFromData(data)
    return !weeks.hasPrimarySharedPayOrLeave() && weeks.hasSecondarySharedPayOrLeave()
  }

  function shouldDisplaySecondaryLeaveAndPayForm (data) {
    return parseWeeksFromData(data).hasSecondarySharedPayOrLeave()
  }

  function formTemplate (text, options) {
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

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
      .replace(/\$father/g, options.father)
  }

  function countWeeks (blocks) {
    return blocks.reduce((total, block) => total + block.end - block.start + 1, 0)
  }

  function blocksToDates (data, blocks) {
    const offsetWeeks = env.getFilter('offsetWeeks')

    return blocks.map((block) => {
      return {
        start: offsetWeeks(startOfWeek(startDay(data)), block.start),
        end: endOfWeek(offsetWeeks(startOfWeek(startDay(data)), block.end))
      }
    })
  }

  function htmlAttributesFromObject (object) {
    if (!object) {
      return
    }
    return Object.entries(object)
      .map((key, value) => `${key}=${value}`)
      .join(' ')
  }

  return {
    hasStartDateError,
    isWeekChecked,
    formTemplate,
    startDay,
    startOfWeek,
    endOfWeek,
    startDateName,
    totalBlockPay,
    shouldDisplayPrimaryLeaveAndPayForm,
    shouldDisplayPrimaryCurtailmentForm,
    shouldDisplaySecondaryLeaveAndPayForm,
    countWeeks,
    blocksToDates,
    htmlAttributesFromObject
  }
}
