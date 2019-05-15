const moment = require('moment')

class Day {
  constructor (yearOrMoment, month, day) {
    if (moment.isMoment(yearOrMoment)) {
      this.createdWith = yearOrMoment
    } else {
      this.createdWith = moment([yearOrMoment, month, day].join('-'), 'YYYY-MM-DD')
    }
  }

  startOfWeek () {
    const newMoment = this.createdWith.clone().startOf('week')
    return new Day(newMoment)
  }

  subtract (amount, unit) {
    const newMoment = this.createdWith.clone().subtract(amount, unit)
    return new Day(newMoment)
  }

  isInPast () {
    return this.createdWith.isBefore(moment(), 'days')
  }

  formatForDisplay () {
    return this.createdWith.format('D MMMM YYYY')
  }
}

module.exports = Day
