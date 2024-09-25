const moment = require('moment')

async function calculateDate (days, months, years, weeks) {
  const today = moment()
  const threeMonthsAgo = today.subtract(3, 'months')
  return threeMonthsAgo
}

module.exports = calculateDate
