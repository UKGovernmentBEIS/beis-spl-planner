const _ = require('lodash')
const Vue = require('vue/dist/vue.common')
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
    toggleLeave(parent, week, true)
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
    weeklyPay: parent === 'primary' ? 1000 : null
  }
}

module.exports = {
  init
}
