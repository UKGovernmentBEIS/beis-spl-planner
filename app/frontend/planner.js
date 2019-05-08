const Vue = require('vue/dist/vue.common')
const Planner = require('./components/Planner.vue')
const { getWeeksArray, nameAndLeaveType } = require('../utils')

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
      primary: parseParent(data, 'primary'),
      secondary: parseParent(data, 'secondary')
    }
  })

  const inputs = document.querySelectorAll('form#leave-and-pay input[type="checkbox"]')
  for (let input of inputs) {
    input.addEventListener('change', function () {
      const parent = this.getAttribute('data-parent')
      const property = this.getAttribute('data-property')
      const week = parseInt(this.value)
      planner.toggleWeek(parent, property, week, this.checked)
    })
  }
}

function parseParent (data, parent) {
  return {
    leave: getWeeksArray(data, parent, 'leave'),
    pay: getWeeksArray(data, parent, 'pay'),
    ...nameAndLeaveType(data, parent)
  }
}

module.exports = {
  init
}
