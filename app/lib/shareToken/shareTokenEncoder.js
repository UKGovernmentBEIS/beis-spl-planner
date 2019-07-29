const delve = require('dlv')
const _ = require('lodash')
const Day = require('../../../common/lib/day')
const { isBirth, isAdoption, isYes, isNo, earliestPrimaryLeaveWeek } = require('../../../common/lib/dataUtils')
const { getBase64Char, convertBase10ToBase64 } = require('./baseMathsUtils')
const { policies, separator, parents, entitlements } = require('./tokenConstants')

/*
 * ENCODES ENTIRE DATA OBJECT:
 *
 * natureOfParenthood = single binary bit for nature-of-parenthood
 * eligibilities = 3 base64 bits for all eligibilities
 * startDate = base64 integer made by concatenating day, month and 4 digit year and converting to base64
 * primarySalary = binary bit for existence of data followed by base64 integer for amount
 * secondarySalary = asAbove
 * salaryPeriods = single base64 character encoding both salary periods
 * weeks = string of base64 characters where each two characters represents 3 weeks.
 *         information is recorded as 1 bit for each of the following primaryLeave, primaryPay, secondaryLeave, secondaryPay
 *
 * fullString = [natureOfParenthood]![eligibilities]![startDate]![primarySalary]![secondarySalary]![salaryPeriods]![weeks]
 *
*/

class ShareTokenEncoder {
  constructor (data) {
    this.data = data
  }

  encode (version) {
    if (version !== 1) {
      return
    }

    return [
      this._encodeNatureOfParenthood(),
      this._encodeLeaveAndPayEligibility(),
      this._encodeStartDate(),
      this._encodeSalary(),
      this._encodeWeeks()
    ].join(separator)
  }

  _encodeNatureOfParenthood () {
    if (isBirth(this.data)) {
      return getBase64Char(0)
    } else if (isAdoption(this.data)) {
      return getBase64Char(1)
    } else {
      return getBase64Char(2)
    }
  }

  _encodeLeaveAndPayEligibility () {
    const binaryEligibility = this._encodeLeaveAndPayEligibilityForParent('primary')
      .concat(this._encodeLeaveAndPayEligibilityForParent('secondary'))
    const eligibilitiesEncodedByOneCharacter = 3
    return _.chunk(binaryEligibility, eligibilitiesEncodedByOneCharacter)
      .map(binaryArrayForOneChar => {
        return getBase64Char(parseInt(binaryArrayForOneChar.join(''), 2))
      })
      .join('')
  }

  _encodeLeaveAndPayEligibilityForParent (parent) {
    return policies[parent].map(policy => {
      const eligibility = this.data[parent][`${policy}-eligible`]
      if (isYes(eligibility)) {
        return '11'
      } else if (isNo(eligibility)) {
        return '10'
      } else {
        return '00'
      }
    })
  }

  _encodeStartDate () {
    const {
      'start-date-day': day,
      'start-date-month': month,
      'start-date-year': year
    } = this.data

    const standardFormatDate = new Day(year, month, day).format('DDMMYYYY')
    return convertBase10ToBase64(parseInt(standardFormatDate))
  }

  _encodeSalary () {
    const [primaryAmount, primaryPeriod] = this._getSalaryInformationForParent('primary')
    const [secondaryAmount, secondaryPeriod] = this._getSalaryInformationForParent('secondary')

    const salaryAmountsEncoding = [primaryAmount, secondaryAmount]
      .map(amount => {
        if (isNaN(amount)) {
          return '0'
        } else {
          return '1' + convertBase10ToBase64(parseInt(amount))
        }
      })
      .join(separator)

    const salaryPeriodsBinary = [primaryPeriod, secondaryPeriod]
      .map(period => {
        switch (period) {
          case 'week':
            return '01'
          case 'month':
            return '10'
          case 'year':
            return '11'
          default:
            return '00'
        }
      })
      .join('')

    const salaryPeriodsEncoding = getBase64Char(parseInt(salaryPeriodsBinary, 2))

    return [salaryAmountsEncoding, salaryPeriodsEncoding].join(separator)
  }

  _getSalaryInformationForParent (parent) {
    if (!this.data[parent]) {
      return [undefined, undefined]
    }
    return [this.data[parent]['salary-amount'], this.data[parent]['salary-period']]
  }

  _encodeWeeks () {
    const earliestPossibleWeek = earliestPrimaryLeaveWeek(this.data)
    const calendarRange = _.range(earliestPossibleWeek, 53).map(n => n.toString())
    // each week is 4 bits, but each character is 6, so we encode every 3 weeks as two characters
    const weeksEncodedByTwoCharacters = 3
    return _(calendarRange)
      .chunk(weeksEncodedByTwoCharacters)
      .map(threeWeekBlock => this._convertThreeWeeksToBinaryString(threeWeekBlock))
      .flatMap(binaryThreeWeekBlock => {
        const firstChar = binaryThreeWeekBlock.substring(0, 6)
        const secondChar = binaryThreeWeekBlock.substring(6)
        // final element only represents one character
        return secondChar.length === 0 ? [firstChar] : [firstChar, secondChar]
      })
      .map(binaryCharString => getBase64Char(parseInt(binaryCharString, 2)))
      .value()
      .join('')
  }

  _convertThreeWeeksToBinaryString (threeWeeks) {
    let threeWeeksBinary = threeWeeks.map(weekNumber => {
      let binary = ''
      parents.forEach(parent => {
        entitlements.forEach(entitlement => {
          const parentEntitlementWeeks = delve(this.data, [parent, entitlement], [])
          if (parentEntitlementWeeks.includes(weekNumber)) {
            binary += '1'
          } else {
            binary += '0'
          }
        })
      })
      return binary
    })
      .join('')
    while (threeWeeksBinary.length < 6) {
      threeWeeksBinary += '0'
    }
    return threeWeeksBinary
  }
}

module.exports = ShareTokenEncoder
