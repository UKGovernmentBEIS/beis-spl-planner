const moment = require('moment')

class Day {
  constructor (yearOrMoment, month, day) {
    if (arguments.length === 0) {
      this.moment = moment.utc()
    } else if (moment.isMoment(yearOrMoment)) {
      this.moment = yearOrMoment
    } else {
      this.moment = moment.utc([yearOrMoment, month, day].join('-'), 'YYYY-MM-DD')
    }
  }

  startOfWeek () {
    const newMoment = this.moment.clone().startOf('week')
    return new Day(newMoment)
  }

  subtract (amount, unit) {
    const newMoment = this.moment.clone().subtract(amount, unit)
    return new Day(newMoment)
  }

  add (amount, unit) {
    const newMoment = this.moment.clone().add(amount, unit)
    return new Day(newMoment)
  }

  isInPast () {
    return this.moment.isBefore(moment.utc(), 'days')
  }

  isValid () {
    return this.moment.isValid()
  }

  invalidAt () {
    return this.moment.invalidAt()
  }

  isBetween (earlierDay, laterDay) {
    return this.moment.isBetween(earlierDay.moment, laterDay.moment)
  }

  formatForDisplay () {
    return this.moment.format('D MMMM YYYY')
  }

  formatForExample () {
    return this.moment.format('D M YYYY')
  }
}

module.exports = Day
