const moment = require('moment')

class Day {
  constructor (yearDateStringOrMoment, month, day) {
    switch (arguments.length) {
      case 0:
        this.moment = moment.utc()
        break
      case 1:
        if (moment.isMoment(yearDateStringOrMoment)) {
          this.moment = yearDateStringOrMoment
        } else {
          const dateString = yearDateStringOrMoment
          this.moment = Day.parseDateStringToMoment(dateString)
        }
        break
      case 3:
        const year = yearDateStringOrMoment
        const dateString = [year, month, day].join('-')
        this.moment = Day.parseDateStringToMoment(dateString)
        break
      default:
        this.moment = moment.invalid()
        break
    }
  }

  static parseDateStringToMoment (dateString) {
    return moment.utc(dateString, ['YYYY-M-D', 'YY-M-D'], true)
  }

  startOfWeek () {
    const newMoment = this.moment.clone().startOf('week')
    return new Day(newMoment)
  }

  mondayStartOfWeek () {
    const newMoment = this.moment.clone().startOf('isoweek')
    return new Day(newMoment)
  }

  endOfWeek () {
    const newMoment = this.moment.clone().endOf('week')
    return new Day(newMoment)
  }

  sundayEndOfWeek () {
    const newMoment = this.moment.clone().endOf('isoweek')
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
