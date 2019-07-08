function getWeekByNumber (weeks, number) {
  return weeks.find(week => week.number === number)
}

function getPropertyIfEligible (week, parent, property) {
  return week[parent][property].eligible && week[parent][property].text
}

module.exports = {
  getWeekByNumber,
  getPropertyIfEligible
}
