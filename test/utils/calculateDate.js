async function calculateDate (days, months, years, weeks) {
  const today = new Date()
  const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
  const day = threeMonthsAgo.getDate()
  const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
  const year = threeMonthsAgo.getFullYear()
  return { day, month, year }
}

module.exports = calculateDate
