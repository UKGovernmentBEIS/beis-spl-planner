/* global localStorage */

const _ = require('lodash')
const Vue = require('vue/dist/vue.common')
const isIexplorer = require('is-iexplorer')
const Stickyfill = require('stickyfill')
const AccessibleLayoutSwitch = require('./components/AccessibleLayoutSwitch.vue')
const Planner = require('./components/Planner.vue')
const { parseParentFromPlanner, parseStartDay } = require('../../utils')
const dataUtils = require('../../../common/lib/dataUtils')
const { parseEligibilityFromData } = require('../../lib/eligibility')

const USE_ACCESSIBLE_LAYOUT = 'use_accessible_layout'

Vue.filter('capitalise', function (value) {
  if (!value) {
    return ''
  }
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

function init (data, interactive) {
  let useAccessibleLayout = localStorage.getItem(USE_ACCESSIBLE_LAYOUT) === 'yes'

  const isBirth = dataUtils.isBirth(data)
  const startWeek = parseStartDay(data).startOfWeek()
  const primary = parseParentFromPlanner(data, 'primary')
  const secondary = parseParentFromPlanner(data, 'secondary')
  const eligibility = parseEligibilityFromData(data)
  const planner = new (Vue.extend(Planner))({
    el: '#planner',
    data: {
      isBirth,
      startWeek,
      primary,
      secondary,
      interactive,
      useAccessibleLayout,
      updateLeaveOrPay,
      eligibility
    },
    mounted: function () {
      patchStickyStylingOnInternetExplorer()
    }
  })

  const accessibleLayoutSwitch = new (Vue.extend(AccessibleLayoutSwitch))({
    el: '#accessibility-switch',
    data: {
      useAccessibleLayout,
      toggleAccessibleLayout
    }
  })

  toggleAccessibleLayout(useAccessibleLayout)

  const minimumWeek = isBirth ? -11 : -2
  function updateLeaveOrPay (parent, property, week, value) {
    if (property === 'leave') {
      updateLeave(parent, week, value, minimumWeek, eligibility)
    } else if (property === 'pay') {
      updatePay(parent, week, value, minimumWeek, eligibility)
    }
  }

  function toggleAccessibleLayout (value) {
    if (value === true || value === false) {
      useAccessibleLayout = value
    } else {
      useAccessibleLayout = !useAccessibleLayout
    }
    localStorage.setItem(USE_ACCESSIBLE_LAYOUT, useAccessibleLayout ? 'yes' : 'no')
    accessibleLayoutSwitch.useAccessibleLayout = useAccessibleLayout
    planner.useAccessibleLayout = useAccessibleLayout
    document.body.classList.toggle('use-accessible-layout', useAccessibleLayout)
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
}

function updateLeave (parent, week, value, minimumWeek, eligibility) {
  // Maternity / adoption leave taken before the 0th week must be in a continuous block.
  let weeksToUpdate
  let earliestSelectedWeek
  if (parent === 'primary') {
    earliestSelectedWeek = 0
  } else {
    const earliestSelectedCheckbox = document.querySelector(`input[type=checkbox][name="${parent}[leave]"]:checked`)
    earliestSelectedWeek = earliestSelectedCheckbox && earliestSelectedCheckbox.value < week ? parseInt(earliestSelectedCheckbox.value) : week
  }

  if (week >= earliestSelectedWeek) {
    if (!eligibility[parent].spl && !eligibility[parent].shpp) {
      weeksToUpdate = getLeaveWeeksToUpdateWhenParentHasNoSharedEligiblity(week, parent, earliestSelectedWeek, minimumWeek, value)
    } else {
      weeksToUpdate = [week]
    }
  } else if (value) {
    // Add leave from selected week to earliestSelectedWeek week.
    weeksToUpdate = _.range(week, earliestSelectedWeek)
  } else {
    // Remove leave before selected week.
    weeksToUpdate = _.range(minimumWeek, week + 1)
  }

  for (let weekToUpdate of weeksToUpdate) {
    const changed = toggleLeave(parent, weekToUpdate, value)
    if (changed) {
      // Pay should always turn on or off with leave.
      togglePay(parent, weekToUpdate, value)
    }
  }
}

function getLeaveWeeksToUpdateWhenParentHasNoSharedEligiblity (week, parent, earliestSelectedWeek, minimumWeek, value) {
  const checkboxes = document.querySelectorAll(`input[type=checkbox][name="${parent}[leave]"]:checked`)
  const latestSelectedCheckbox = checkboxes.length === 0 ? null : checkboxes[checkboxes.length - 1]
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
    let maximumPeriodDisplayedAsInitialLeave = parent === 'primary' ? (-minimumWeek + 52) : 8
    return _.range(week, maximumPeriodDisplayedAsInitialLeave)
  }
}

function updatePay (parent, week, value, minimumWeek, eligibility) {
  if (value && !getCheckbox(parent, 'leave', week).checked) {
    // Pay cannot be added without leave.
    updateLeave(parent, week, true, minimumWeek, eligibility)
    return
  }

  // Maternity / adoption pay must be taken in a continuous block from the start
  // of the maternity / adoption leave until the pay is curtailed.
  // After the end of compulsory leave, it is valid for non-continuous pay to be
  // taken as Statutory Shared Parental Pay.
  let weeksToUpdate
  const lastCompulsoryWeek = 1
  if (parent === 'secondary') {
    const lastPossiblePaternityLeave = 7
    if (!eligibility.secondary.shpp && !eligibility.secondary.spl) {
      weeksToUpdate = getPayWeeksToUpdateWhenSecondaryHasNoSharedEligiblity(week, parent, value, lastPossiblePaternityLeave)
    } else {
      // Add pay from earliest week.
      weeksToUpdate = [week]
    }
  } else if (eligibility.primary.shpp && week > lastCompulsoryWeek) {
    weeksToUpdate = [week]
  } else if (value) {
    // Add pay from earliest week.
    weeksToUpdate = _.range(minimumWeek, week + 1)
  } else {
    if (eligibility.primary.shpp) {
      // Remove pay until end of compulsory leave.
      weeksToUpdate = _.range(week, lastCompulsoryWeek + 1)
    } else {
      // Remove all pay until end of calendar.
      weeksToUpdate = _.range(week, -minimumWeek + 52)
    }
  }
  console.log('weeksToUpdate ', weeksToUpdate)
  for (let weekToUpdate of weeksToUpdate) {
    togglePay(parent, weekToUpdate, value)
  }
}

function getPayWeeksToUpdateWhenSecondaryHasNoSharedEligiblity (week, parent, value, lastPossiblePaternityLeave) {
  if (value) {
    // add pay to all cells before selected
    const earliestSelectedCheckbox = document.querySelector(`input[type=checkbox][name="${parent}[leave]"]:checked`)
    const earliestSelectedWeek = earliestSelectedCheckbox && earliestSelectedCheckbox.value < week ? parseInt(earliestSelectedCheckbox.value) : week
    return _.range(earliestSelectedWeek, week + 1)
  } else {
    // Remove pay for all cells after selected
    return _.range(week, lastPossiblePaternityLeave + 1)
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
  const changeEvent = document.createEvent('HTMLEvents')
  changeEvent.initEvent('change', false, true)
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
