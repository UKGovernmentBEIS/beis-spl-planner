const moment = require('moment')

class Week {
  constructor (yearOrMoment, month, day) {
    if (moment.isMoment(yearOrMoment)) {
      this.createdWith = yearOrMoment
    } else {
      this.createdWith = moment([yearOrMoment, month, day].join('-'), 'YYYY-MM-DD')
    }
  }

  start () {
    const newMoment = this.createdWith.clone().startOf('week')
    return new Week(newMoment)
  }

  subtract (amount, unit) {
    const newMoment = this.createdWith.clone().subtract(amount, unit)
    return new Week(newMoment)
  }

  isInPast () {
    return this.createdWith.isBefore(moment(), 'days')
  }

  formatForDisplay () {
    return this.createdWith.format('D MMMM YYYY')
  }
}

module.exports = Week
