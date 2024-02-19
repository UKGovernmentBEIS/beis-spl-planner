const delve = require('dlv')
const { getWeeksArray, parseWeeksFromData } = require('./utils')
const Day = require('../common/lib/day')
const { parseEligibilityFromData } = require('./lib/eligibility')
const { getBlockLength, getPaternalBlockLength, getRemainingLeaveAllowance, getRemainingPayAllowance, parseLeaveBlocks, parseSplLeaveBlocks } = require('./lib/blocks')
const _ = require('lodash')

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

  function hasCalendarError (errors) {
    return errors && Object.keys(errors).some(key => key.startsWith('calendar.'))
  }

  function startDay (data) {
    return new Day(data['start-date-year'], data['start-date-month'], data['start-date-day'])
  }

  function startOfWeek (day) {
    return day.mondayStartOfWeek()
  }

  function endOfWeek (day) {
    return day.sundayEndOfWeek()
  }

  function startDateName (data) {
    return isBirth(data) ? 'due date' : 'placement date'
  }

  function hasEitherSalary (data) {
    return !!delve(data, ['primary', 'salary-amount']) || !!delve(data, ['secondary', 'salary-amount'])
  }

  function zeroWeek (data) {
    return startOfWeek(startDay(data))
  }

  function totalBlockPay (block) {
    const primaryPay = block.primary && parseFloat(block.primary.substring(1))
    const secondaryPay = block.secondary && parseFloat(block.secondary.substring(1))
    return '£' + ((primaryPay || 0) + (secondaryPay || 0)).toFixed(2)
  }

  function numberAsString (block) {
    var weekCount = block.end - block.start + 1
    return weekCount.toString()
  }

  function displayPayBlockTotal (data) {
    const eligibility = parseEligibilityFromData(data)
    return eligibility.primary.statutoryPay && // Cannot get exact value for Maternity Allowance.
           !isNaN(data.primary['salary-amount']) &&
           !isNaN(data.secondary['salary-amount'])
  }

  function shouldDisplayPrimaryLeaveAndPayForm (data) {
    if (data.visualPlanner) {
      return parseWeeksFromData(data).hasPrimarySharedPayOrLeave()
    } else {
      return !!delve(data, ['leave-blocks', 'primary', 'spl'])
    }
  }

  function shouldDisplayPrimaryCurtailmentForm (data) {
    if (data.visualPlanner) {
      const weeks = parseWeeksFromData(data)
      return !weeks.hasPrimarySharedPayOrLeave() && weeks.hasSecondarySharedPayOrLeave()
    } else {
      return !delve(data, ['leave-blocks', 'primary', 'spl']) && !!delve(data, ['leave-blocks', 'secondary', 'spl'])
    }
  }

  function shouldDisplaySecondaryLeaveAndPayForm (data) {
    if (data.visualPlanner) {
      return parseWeeksFromData(data).hasSecondarySharedPayOrLeave()
    } else {
      return !!delve(data, ['leave-blocks', 'secondary', 'spl'])
    }
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
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
  }

  function blockLength (block) {
    return getBlockLength(block)
  }

  function paternalBlockLength (block) {
    return getPaternalBlockLength(block)
  }

  function remainingLeaveAllowance (leaveBlocksDataObject) {
    const leaveBlocks = parseLeaveBlocks(leaveBlocksDataObject)
    return getRemainingLeaveAllowance(leaveBlocks)
  }

  function remainingPayAllowance (leaveBlocksDataObject) {
    const leaveBlocks = parseLeaveBlocks(leaveBlocksDataObject)
    return getRemainingPayAllowance(leaveBlocks)
  }

  function hasTakenSpl (leaveBlocksDataObject, parent) {
    return parseSplLeaveBlocks(leaveBlocksDataObject, parent).length > 0
  }

  function weeks (number) {
    const weekOrWeeks = Math.abs(number) === 1 ? 'week' : 'weeks'
    return `${number} ${weekOrWeeks}`
  }

  function mapValuesToSelectOptions (values, textMacro, selected) {
    return values.map((value, i) => ({
      value: value,
      text: textMacro(value, i),
      selected: value === parseInt(selected) || (selected === undefined && i === 0)
    }))
  }

  function errorMessages (errors) {
    return _.values(errors).map(e => e.text)
  }

  return {
    hasStartDateError,
    hasCalendarError,
    isWeekChecked,
    formTemplate,
    startDay,
    startOfWeek,
    endOfWeek,
    startDateName,
    hasEitherSalary,
    totalBlockPay,
    numberAsString,
    displayPayBlockTotal,
    shouldDisplayPrimaryLeaveAndPayForm,
    shouldDisplayPrimaryCurtailmentForm,
    shouldDisplaySecondaryLeaveAndPayForm,
    countWeeks,
    blocksToDates,
    htmlAttributesFromObject,
    blockLength,
    paternalBlockLength,
    remainingLeaveAllowance,
    remainingPayAllowance,
    hasTakenSpl,
    weeks,
    zeroWeek,
    mapValuesToSelectOptions,
    ...require('./views/accessible-planner/answers-so-far/filters')(env),
    errorMessages
  }
}
