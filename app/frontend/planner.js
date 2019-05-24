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
      secondary: parseParent(data, 'secondary')
    }
  })

  const inputs = document.querySelectorAll('form#leave-and-pay input[type="checkbox"]')
  for (let input of inputs) {
    input.addEventListener('change', function () {
      const parent = this.getAttribute('data-parent')
      const property = this.getAttribute('data-property')
      const week = parseInt(this.value)
      planner.updateWeek(parent, property, week, this.checked)
    })
  }
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
