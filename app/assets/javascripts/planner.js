/* global Event */

const _ = require('lodash')
const Vue = require('vue/dist/vue.common')
const isIexplorer = require('is-iexplorer')
const Stickyfill = require('stickyfill')
const Planner = require('./components/Planner.vue')
const { parseParentFromPlanner, parseStartDay } = require('../../utils')
const dataUtils = require('../../../common/lib/dataUtils')

Vue.filter('capitalise', function (value) {
  if (!value) {
    return ''
  }
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

function init (data, interactive) {
  const isBirth = dataUtils.isBirth(data)
  const startWeek = parseStartDay(data).startOfWeek()
  const primary = parseParentFromPlanner(data, 'primary')
  const secondary = parseParentFromPlanner(data, 'secondary')
  const planner = new (Vue.extend(Planner))({
    el: '#planner',
    data: {
      isBirth,
      startWeek,
      primary,
      secondary,
      interactive,
      updateLeaveOrPay,
      reset
    },
    mounted: function () {
      patchStickyStylingOnInternetExplorer()
    }
  })

  const minimumWeek = isBirth ? -11 : -2
  function updateLeaveOrPay (parent, property, week, value) {
    if (property === 'leave') {
      updateLeave(parent, week, value, minimumWeek)
    } else if (property === 'pay') {
      updatePay(parent, week, value, minimumWeek)
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
    function isNotCompulsory (checkbox) {
      return !(checkbox.getAttribute('data-parent') === 'primary' && ['0', '1'].includes(checkbox.value))
    }
    const checkboxes = Array.from(document.querySelectorAll('form#leave-and-pay input[type="checkbox"]:checked'))
    checkboxes
      .filter(checkbox => isNotCompulsory(checkbox))
      .forEach(checkbox => {
        checkbox.checked = false
        const changeEvent = new Event('change', { cancelable: true })
        checkbox.dispatchEvent(changeEvent)
      })
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

function updatePay (parent, week, value, minimumWeek) {
  if (value && !getCheckbox(parent, 'leave', week).checked) {
    // Pay cannot be added without leave.
    updateLeave(parent, week, true)
    return
  }

  // Maternity / adoption pay must be taken in a continuous block from the start
  // of the maternity / adoption leave until the pay is curtailed.
  // After the end of compulsory leave, it is valid for non-continuous pay to be
  // taken as Statutory Shared Parental Pay.
  let weeksToUpdate
  const lastCompulsoryWeek = 1
  if (parent !== 'primary' || week > lastCompulsoryWeek) {
    weeksToUpdate = [week]
  } else if (value) {
    // Add pay from earliest week.
    weeksToUpdate = _.range(minimumWeek, week + 1)
  } else {
    // Remove pay until end of compulsory leave.
    weeksToUpdate = _.range(week, lastCompulsoryWeek + 1)
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
