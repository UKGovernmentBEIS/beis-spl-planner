const moment = require('moment')

class Day {
  constructor (yearDateStringOrMoment, month, day) {
    if (arguments.length === 0) {
      this.moment = moment.utc()
    } else if (/^(\d\d)?\d\d-\d\d?-\d\d?$/.test(yearDateStringOrMoment)) {
      this.moment = moment.utc(yearDateStringOrMoment, 'YYYY-MM-DD')
    } else if (moment.isMoment(yearDateStringOrMoment)) {
      this.moment = yearDateStringOrMoment
    } else {
      this.moment = moment.utc([yearDateStringOrMoment, month, day].join('-'), 'YYYY-MM-DD')
    }
  }

  startOfWeek () {
    const newMoment = this.moment.clone().startOf('week')
    return new Day(newMoment)
  }

  endOfWeek () {
    const newMoment = this.moment.clone().endOf('week')
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

  format (format) {
    return this.moment.format(format)
  }

  date () {
    return this.moment.date()
  }

  monthOneIndexed () {
    return this.moment.month() + 1
  }

  year () {
    return this.moment.year()
  }
}

module.exports = Day
