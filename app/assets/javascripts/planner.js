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
      updateLeave(parent, week, value, minimumWeek)
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

function updateLeave (parent, week, value, minimumWeek) {
  // Maternity / adoption leave taken before the 0th week must be in a continuous block.
  let weeksToUpdate
  if (week >= 0) {
    weeksToUpdate = [week]
  } else if (value) {
    // Add leave from selected week to 0th week.
    weeksToUpdate = _.range(week, 0)
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

function updatePay (parent, week, value, minimumWeek, eligibility) {
  if (value && !getCheckbox(parent, 'leave', week).checked) {
    // Pay cannot be added without leave.
    updateLeave(parent, week, true, eligibility)
    return
  }

  // Maternity / adoption pay must be taken in a continuous block from the start
  // of the maternity / adoption leave until the pay is curtailed.
  // After the end of compulsory leave, it is valid for non-continuous pay to be
  // taken as Statutory Shared Parental Pay.
  let weeksToUpdate
  const lastCompulsoryWeek = 1
  if (parent !== 'primary' || (eligibility.primary.shpp && week > lastCompulsoryWeek)) {
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

  for (let weekToUpdate of weeksToUpdate) {
    togglePay(parent, weekToUpdate, value)
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
