const _ = require('lodash')
const Vue = require('vue/dist/vue.common')
const isIexplorer = require('is-iexplorer')
const stickybits = require('stickybits')
const Stickyfill = require('stickyfill')
const Planner = require('./components/Planner.vue')
const { getWeeksArray } = require('../utils')

Vue.filter('capitalise', function (value) {
  if (!value) {
    return ''
  }
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

function init (data) {
  const planner = new (Vue.extend(Planner))({
    el: '#planner',
    data: {
      isBirth: data['birth-or-adoption'] === 'birth',
      // TODO: Get start week from data.
      startWeek: '2019-09-08',
      primary: parseParent(data, 'primary'),
      secondary: parseParent(data, 'secondary'),
      updateLeaveOrPay: updateLeaveOrPay
    },
    mounted: function () {
      if (!stickyIsSupported()) {
        patchStickyStyling()
      }
    }
  })

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

function updateLeaveOrPay (parent, property, week, value) {
  if (property === 'leave') {
    updateLeave(parent, week, value)
  } else if (property === 'pay') {
    updatePay(parent, week, value)
  }
}

function updateLeave (parent, week, value) {
  // Leave before the 0th week must be in a continuous block.
  let weeksToUpdate
  if (week >= 0) {
    weeksToUpdate = [week]
  } else if (value) {
    // Add leave from selected week to 0th week.
    weeksToUpdate = _.range(week, 0)
  } else {
    // Remove leave before selected week.
    weeksToUpdate = _.range(-11, week + 1)
  }

  for (let weekToUpdate of weeksToUpdate) {
    const changed = toggleLeave(parent, weekToUpdate, value)
    if (changed) {
      // Pay should always turn on or off with leave.
      togglePay(parent, weekToUpdate, value)
    }
  }
}

function updatePay (parent, week, value) {
  if (value) {
    // Leave must always be taken with pay.
    updateLeave(parent, week, true)
    togglePay(parent, week, true)
  } else {
    togglePay(parent, week, false)
  }
}

function toggleLeave (parent, week, value) {
  return toggleCheckbox(parent, 'leave', week, value)
}

function togglePay (parent, week, value) {
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

function parseParent (data, parent) {
  return {
    leaveWeeks: getWeeksArray(data, parent, 'leave'),
    payWeeks: getWeeksArray(data, parent, 'pay'),
    // TODO: Get weekly pay from data.
    weeklyPay: null
  }
}

// Idea taken from implementation of stickybits.js feature detection.
// See: https://github.com/dollarshaveclub/stickybits/blob/e3762698a3c034e3add5456a294604dec6cfb53a/src/stickybits.js#L110
function stickyIsSupported () {
  const test = document.head.style
  test.position = 'sticky'
  const isSupported = !!test.position
  test.position = ''
  return isSupported
}

function patchStickyStyling () {
  // Unfortunately, we need to use two separate polyfill libraries and then some manual handling to deal with sticky
  // styling of the elements on the planner page where it is not natively supported (e.g. iOS and Internet Explorer).

  // The Stickyfill library works for the sidebar, but not for table headers.
  const sidebar = document.getElementById('sidebar')
  const stickyfill = Stickyfill()
  stickyfill.add(sidebar)

  if (!isIexplorer) {
    // The stickybits library does not work for the sidebar,
    // but it does mostly work for table headers (except on Internet Explorer).
    stickybits('#calendar table thead tr:first-child th')
    stickybits('#calendar table thead tr:nth-child(2) th', { stickyBitStickyOffset: 48 })
  } else {
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
}

module.exports = {
  init
}
