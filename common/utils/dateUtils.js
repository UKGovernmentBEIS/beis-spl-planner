const moment = require('moment')

function convertToMoment (year, month, day) {
  return moment([year, month, day].join('-'), 'YYYY-MM-DD')
}

function formatForDisplay (momentDate) {
  return momentDate.format('D MMMM YYYY')
}

module.exports = {
  convertToMoment,
  formatForDisplay
}
