function getWeekByNumber (weeks, number) {
  return weeks.find(week => week.number === number)
}

module.exports = {
  getWeekByNumber
}
