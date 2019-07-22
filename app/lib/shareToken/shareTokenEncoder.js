const { chunk, isUndefined, range } = require('lodash')
const Day = require('../../../common/lib/day')
const { isBirth } = require('../../../common/lib/dataUtils')
const { getBase64Char, convertBase10ToBase64 } = require('./baseMathsUtils')
const { policies, separator, parents, entitlements } = require('./tokenConstants')

/*
 * ENCODES ENTIRE DATA OBJECT:
 *
 * birthOrAdoption = single binary bit for birth-or-adoption
 * eligibilities = 3 base64 bits for all eligibilities
 * startDate = base64 integer made by concatenating day, month and 4 digit year and converting to base64
 * primarySalary = binary bit for existence of data followed by base64 integer for amount
 * secondarySalary = asAbove
 * salaryPeriods = single base64 character encoding both salary periods
 * weeks = string of base64 characters where each two characters represents 3 weeks.
 *         information is recorded as 1 bit for each of the following primaryLeave, primaryPay, secondaryLeave, secondaryPay
 *
 * fullString = [birthOrAdoption]+[eligibilities]+[startDate]+[primarySalary]+[secondarySalary]+[salaryPeriods]+[weeks]
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
      this._encodeBirthOrAdoption(),
      this._encodeLeaveAndPayEligibility(),
      this._encodeStartDate(),
      this._encodeSalary(),
      this._encodeWeeks()
    ].join(separator)
  }

  _encodeBirthOrAdoption () {
    return this.data['birth-or-adoption'] === 'birth' ? getBase64Char(0) : getBase64Char(1)
  }

  _encodeLeaveAndPayEligibility () {
    const binaryEligibility = this._encodeLeaveAndPayEligibilityForParent('primary')
      .concat(this._encodeLeaveAndPayEligibilityForParent('secondary'))
    const eligibilitiesEncodedByOneCharacter = 3
    return chunk(binaryEligibility, eligibilitiesEncodedByOneCharacter)
      .map(binaryArrayForOneChar => {
        return getBase64Char(parseInt(binaryArrayForOneChar.join(''), 2))
      })
      .join('')
  }

  _encodeLeaveAndPayEligibilityForParent (parent) {
    const binaryEncoding = policies[parent].map(policy => {
      const eligibility = policy + '-eligible'
      let binary = ''
      if (this.data[parent][eligibility]) {
        binary += '1'
        binary += this.data[parent][eligibility] === 'yes' ? '1' : '0'
      } else {
        binary += '00'
      }
      return binary
    })
    return binaryEncoding
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
        const existence = isUndefined(amount) ? '0' : '1'
        const amountEncoding = existence === '1' ? convertBase10ToBase64(parseInt(amount)) : ''
        return existence.concat(amountEncoding)
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
    const calendarRange = (isBirth(this.data) ? range(-11, 53) : range(-2, 53)).map(n => n.toString())
    // each week is 4 bits, but each character is 6, so we encode every 3 weeks as two characters
    const weeksEncodedByTwoCharacters = 3
    return chunk(calendarRange, weeksEncodedByTwoCharacters)
      .map(threeWeekBlock => this._convertThreeWeeksToBinaryString(threeWeekBlock))
      .flatMap(binaryThreeWeekBlock => {
        const firstChar = binaryThreeWeekBlock.substring(0, 6)
        const secondChar = binaryThreeWeekBlock.substring(6)
        // final element only represents one character
        return secondChar.length === 0 ? [firstChar] : [firstChar, secondChar]
      })
      .map(binaryCharString => getBase64Char(parseInt(binaryCharString, 2)))
      .join('')
  }

  _convertThreeWeeksToBinaryString (threeWeeks) {
    return threeWeeks.map(weekNumber => {
      let binary = ''
      parents.forEach(parent => {
        entitlements.forEach(entitlement => {
          if (this.data[parent][entitlement].includes(weekNumber)) {
            binary += '1'
          } else {
            binary += '0'
          }
        })
      })
      return binary
    })
      .join('').padEnd(6, '0')
  }
}

module.exports = ShareTokenEncoder
