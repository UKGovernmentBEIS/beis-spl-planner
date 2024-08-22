async function calculateDate (days, months, years, weeks) {
  const today = new Date()
  // const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
  const dateCalculated = new Date(
    today.getFullYear() + years,
    today.getMonth() + months,
    today.getDate() + days + weeks * 7
  )
  const day = dateCalculated.getDate()
  const month = dateCalculated.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
  const year = dateCalculated.getFullYear()
  return { day, month, year, dateCalculated }
}

module.exports = calculateDate
