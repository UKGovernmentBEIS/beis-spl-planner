function formatDate (addition, day, month, year) {
  return `${addition} ${day.toString()} ${month.toString()} ${year.toString()}`
}

module.exports = formatDate
