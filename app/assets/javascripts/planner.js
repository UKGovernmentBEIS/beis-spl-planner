/* global Event */

const _ = require('lodash')
const Vue = require('vue/dist/vue.common')
const isIexplorer = require('is-iexplorer')
const Stickyfill = require('stickyfill')
const Planner = require('./components/Planner.vue')
const { parseParentFromPlanner, parseStartDay } = require('../../utils')
const dataUtils = require('../../../common/lib/dataUtils')
const { parseEligibilityFromData } = require('../../lib/eligibility')

Vue.filter('capitalize', function (value) {
  if (!value) {
    return ''
  }
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

function init (data, interactive) {
  const natureOfParenthood = dataUtils.natureOfParenthood(data)
  const startWeek = parseStartDay(data).mondayStartOfWeek()
  const primary = parseParentFromPlanner(data, 'primary')
  const secondary = parseParentFromPlanner(data, 'secondary')
  const eligibility = parseEligibilityFromData(data)
  const planner = new (Vue.extend(Planner))({
    el: '#planner',
    data: {
      natureOfParenthood,
      startWeek,
      primary,
      secondary,
      interactive,
      updateLeaveOrPay,
      reset,
      eligibility,
      formData: data
    },
    mounted: function () {
      patchStickyStylingOnInternetExplorer()
    }
  })

  const minimumWeek = dataUtils.earliestPrimaryLeaveWeek(data)
  function updateLeaveOrPay (parent, property, week, value) {
    if (property === 'leave') {
      updateLeave(parent, week, value, minimumWeek, eligibility)
    } else if (property === 'pay') {
      updatePay(parent, week, value, minimumWeek, eligibility)
    }
  }

  if (interactive) {
    const checkboxes = document.querySelectorAll('form#leave-and-pay input[type="checkbox"]')
    for (let checkbox of checkboxes) {
      checkbox.addEventListener('change', function () {
        const parent = this.getAttribute('data-parent')
        const property = this.getAttribute('data-property')
        const week = parseInt(this.value)
        planner.updateWeek(parent, property, week, this.checked)
      })
    }
  }

  function reset () {
    const parents = ['primary', 'secondary']
    const weekNumbers = _.range(minimumWeek, 53)
    parents.forEach(parent => {
      weekNumbers.forEach(weekNumber => {
        updateLeaveOrPay(parent, 'leave', weekNumber, false)
      })
    })
  }
}

function updateLeave (parent, week, value, minimumWeek, eligibility) {
  // Maternity / adoption leave taken before the 0th week must be in a continuous block.
  let weeksToUpdate
  const hasNoSharedEligibility = !eligibility[parent].spl && !eligibility[parent].shpp

  if (week < 0) {
    weeksToUpdate = getLeaveWeeksToUpdateWhenBeforeZeroWeek(week, value, minimumWeek)
  } else if (hasNoSharedEligibility) {
    weeksToUpdate = getLeaveWeeksToUpdateWhenParentHasNoSharedEligiblity(week, parent, minimumWeek, value)
  } else {
    weeksToUpdate = [week]
  }

  for (let weekToUpdate of weeksToUpdate) {
    const changed = toggleLeave(parent, weekToUpdate, value)
    if (changed) {
      // Pay should always turn on or off with leave.
      togglePay(parent, weekToUpdate, value)
    }
  }
}

function getLeaveWeeksToUpdateWhenBeforeZeroWeek (week, value, minimumWeek) {
  if (value) {
    // Add leave from selected week to earliestSelectedWeek week.
    return _.range(week, 0)
  } else {
    // Remove leave before selected week.
    return _.range(minimumWeek, week + 1)
  }
}

function getLeaveWeeksToUpdateWhenParentHasNoSharedEligiblity (week, parent, minimumWeek, value) {
  const checkboxes = document.querySelectorAll(`input[type=checkbox][name="${parent}[leave]"]:checked`)
  const earliestSelectedCheckbox = _.first(checkboxes)
  const earliestSelectedWeek = earliestSelectedCheckbox && earliestSelectedCheckbox.value < week ? parseInt(earliestSelectedCheckbox.value) : week
  const latestSelectedCheckbox = _.last(checkboxes)
  const latestSelectedWeek = latestSelectedCheckbox && latestSelectedCheckbox.value > week ? parseInt(latestSelectedCheckbox.value) : week
  if (week === earliestSelectedWeek) {
    if (week < latestSelectedWeek && value) {
      // if later leave exists fill in all cells up to later leave
      return _.range(week, latestSelectedWeek + 1)
    } else {
      // only toggle selected week if clicking on first week
      return [week]
    }
  } else if (value) {
    // add leave from earliestSelectedWeek to selected week
    return _.range(earliestSelectedWeek, latestSelectedWeek + 1)
  } else {
    // remove leave after selected week
    let maximumPeriodDisplayedAsInitialLeave = parent === 'primary' ? 53 : 8
    return _.range(week, maximumPeriodDisplayedAsInitialLeave)
  }
}

function updatePay (parent, week, value, minimumWeek, eligibility) {
  if (value && !getCheckbox(parent, 'leave', week).checked) {
    // Pay cannot be added without leave.
    updateLeave(parent, week, true, minimumWeek, eligibility)
    return
  }

  let weeksToUpdate
  const lastCompulsoryWeek = 1
  if (parent === 'secondary') {
    weeksToUpdate = getSecondaryPayWeeksToUpdate(week, value, eligibility)
  } else if (week < lastCompulsoryWeek) {
    weeksToUpdate = getPrimaryPayWeeksToUpdateBeforeCompulsoryWeeks(week, value, minimumWeek, eligibility, lastCompulsoryWeek)
  } else {
    weeksToUpdate = getPrimaryPayWeeksToUpdateAfterCompulsoryWeeks(week, value, minimumWeek, eligibility)
  }

  for (let weekToUpdate of weeksToUpdate) {
    togglePay(parent, weekToUpdate, value)
  }
}

function getSecondaryPayWeeksToUpdate (week, value, eligibility) {
  const lastPossiblePaternityLeave = 7
  const hasNoSharedEligibility = !eligibility.secondary.shpp && !eligibility.secondary.spl
  const earliestSelectedCheckbox = document.querySelector(`input[type=checkbox][name="secondary[leave]"]:checked`)
  const earliestSelectedWeek = earliestSelectedCheckbox && earliestSelectedCheckbox.value < week ? parseInt(earliestSelectedCheckbox.value) : week
  if (hasNoSharedEligibility) {
    if (value) {
      // add pay to all cells before selected
      return _.range(earliestSelectedWeek, week + 1)
    } else if (week === earliestSelectedWeek) {
      // only toggle selected week if clicking on first week
      return [week]
    } else {
      // Remove pay for all cells after selected
      return _.range(week, lastPossiblePaternityLeave + 1)
    }
  } else {
    return [week]
  }
}

function getPrimaryPayWeeksToUpdateBeforeCompulsoryWeeks (week, value, minimumWeek, eligibility, lastCompulsoryWeek) {
  // Maternity / adoption pay must be taken in a continuous block from the start
  // of the maternity / adoption leave until the pay is curtailed.
  if (value) {
    // Add pay from earliest week.
    return _.range(minimumWeek, week + 1)
  } else {
    // Remove pay until end of compulsory leave, or if not shpp eligible remove all pay.
    const finalWeekToUpdate = eligibility.primary.shpp ? lastCompulsoryWeek + 1 : 53
    return _.range(week, finalWeekToUpdate)
  }
}

function getPrimaryPayWeeksToUpdateAfterCompulsoryWeeks (week, value, minimumWeek, eligibility) {
  // After the end of compulsory leave, it is valid for non-continuous pay to be
  // taken as Statutory Shared Parental Pay.
  if (eligibility.primary.shpp) {
    return [week]
  } else if (value) {
    // Add pay from earliest week.
    return _.range(minimumWeek, week + 1)
  } else {
    // Remove all pay until end of calendar.
    return _.range(week, 53)
  }
}

function toggleLeave (parent, week, value) {
  return toggleCheckbox(parent, 'leave', week, value)
}

function togglePay (parent, week, value) {
  if (value && !getCheckbox(parent, 'leave', week).checked) {
    // Cannot have pay without leave.
    return false
  }
  return toggleCheckbox(parent, 'pay', week, value)
}

function toggleCheckbox (parent, property, week, value) {
  const checkbox = getCheckbox(parent, property, week)
  if (!checkbox || checkbox.disabled || checkbox.checked === value) {
    return false
  }
  checkbox.checked = value
  const changeEvent = new Event('change', { cancelable: true })
  checkbox.dispatchEvent(changeEvent)
  return true
}

function getCheckbox (parent, property, week) {
  const query = `input[type="checkbox"][name="${parent}[${property}]"][value="${week}"]`
  return document.querySelector(query)
}

function patchStickyStylingOnInternetExplorer () {
  if (!isIexplorer) {
    return
  }

  // The Stickyfill library works for the sidebar, but not for table headers.
  const sidebar = document.getElementById('sidebar')
  const stickyfill = Stickyfill()
  stickyfill.add(sidebar)

  // Internet Explorer needs special handling.
  // Inspiration comes from: https://stackoverflow.com/a/25902860/1213714
  const table = document.querySelector('#calendar table')
  window.addEventListener('scroll', function () {
    const boundingClientRect = table.getBoundingClientRect()
    const { top, bottom } = boundingClientRect
    const offset = (top < 0 && bottom > 0) ? -top : 0
    const headers = document.querySelectorAll('thead th')
    for (let th of headers) {
      const translate = `translate(0, ${offset}px)`
      th.style.transform = translate
    }
  })
}

module.exports = {
  init
}
