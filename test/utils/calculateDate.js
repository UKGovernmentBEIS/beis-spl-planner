const moment = require('moment')

async function calculateDate (days, months, years, weeks) {
  const today = moment() //Makes use of moment.js to find the date 
  const threeMonthsAgo = today.subtract(3, 'months') //Takes test run date and retrieves the date 3 months prior 
  return threeMonthsAgo 
}

module.exports = calculateDate
