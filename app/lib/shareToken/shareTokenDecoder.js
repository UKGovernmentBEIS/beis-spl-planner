const { chunk } = require('lodash')
const dset = require('dset')
const {
  getBase64Index,
  convertBase10ToBinary,
  convertBase64ToBase10,
  convertBase64ToBinary
} = require('./baseMathsUtils')
const { separator, policies, parents, entitlements } = require('./tokenConstants')

class ShareTokenEncoder {
  constructor (encoded) {
    this.encoded = encoded
    this.data = {}
  }

  decode () {
    const [
      birthOrAdoption,
      eligibilities,
      startDate,
      primarySalary,
      secondarySalary,
      salaryPeriods,
      weeks
    ] = this.encoded.split(separator)
    this._decodeBirthOrAdoption(birthOrAdoption)
    this._decodeEligibility(eligibilities)
    this._decodeStartDate(startDate)
    this._decodeSalaryInformation(primarySalary, secondarySalary, salaryPeriods)
    this._decodeWeeks(weeks)
    return this.data
  }

  _decodeBirthOrAdoption (birthOrAdoption) {
    this.data['birth-or-adoption'] = birthOrAdoption === '0' ? 'birth' : 'adoption'
  }

  _decodeEligibility (eligibilities) {
    const binaryEncoding = eligibilities.split('')
      .map(getBase64Index)
      .map(convertBase10ToBinary)
      .map(binary => binary.padStart(6, '0'))
      .join('')

    const bitsPerEligibility = 2
    chunk(binaryEncoding, bitsPerEligibility).forEach((eligibilityEncoding, idx) => {
      if (eligibilityEncoding[0] === '1') {
        const parent = idx < policies.primary.length ? 'primary' : 'secondary'
        const policyIndex = parent === 'primary' ? idx : idx - policies.primary.length
        const policy = `${policies[parent][policyIndex]}-eligible`
        dset(this.data, `${parent}.${policy}`, getYesOrNo(eligibilityEncoding[1]))
      }
    })
  }

  _decodeStartDate (startDate) {
    const base10Date = convertBase64ToBase10(startDate).toString().padStart(8, '0')
    this.data['start-date-day'] = base10Date.substring(0, 2)
    this.data['start-date-month'] = base10Date.substring(2, 4)
    this.data['start-date-year'] = base10Date.substring(4)
  }

  _decodeSalaryInformation (primarySalary, secondarySalary, salaryPeriods) {
    this._decodeSalaryAmount(primarySalary, 'primary')
    this._decodeSalaryAmount(secondarySalary, 'secondary')
    this._decodeSalaryPeriods(salaryPeriods)
  }

  _decodeSalaryAmount (salary, parent) {
    if (salary[0] === '0') {
      // salary not supplied
      return
    } else {
      // remove salary existence bit
      salary = salary.substring(1)
    }
    dset(this.data, `${parent}.salary-amount`, convertBase64ToBase10(salary).toString())
  }

  _decodeSalaryPeriods (salaryPeriods) {
    const bitsPerSalaryPeriod = 2
    const binarySalaryPeriods = convertBase64ToBinary(salaryPeriods).padStart(4, '0').split('')
    chunk(binarySalaryPeriods, bitsPerSalaryPeriod)
      .map(binaryArray => binaryArray.join(''))
      .forEach((periodBinary, idx) => {
        if (periodBinary === '00') {
          return
        }
        const parent = idx === 0 ? 'primary' : 'secondary'
        const salaryPeriod = getSalaryPeriod(periodBinary)
        dset(this.data, `${parent}.salary-period`, salaryPeriod)
      })
  }

  _decodeWeeks (weeks) {
    parents.forEach(parent => {
      entitlements.forEach(entitlement => {
        dset(this.data, `${parent}.${entitlement}`, [])
      })
    })

    const binaryWeeks = weeks.split('')
      .map(convertBase64ToBinary)
      .map(binaryString => binaryString.padStart(6, '0'))
      .join('')

    const weekOffset = this.data['birth-or-adoption'] === 'birth' ? 11 : 2

    const bitsPerWeek = 4
    chunk(binaryWeeks, bitsPerWeek).forEach((week, weekIdx) => {
      const [primaryLeave, primaryPay, secondaryLeave, secondaryPay] = week
      const weekNumber = (weekIdx - weekOffset).toString()
      if (primaryLeave === '1') {
        this.data.primary.leave.push(weekNumber)
      }
      if (primaryPay === '1') {
        this.data.primary.pay.push(weekNumber)
      }
      if (secondaryLeave === '1') {
        this.data.secondary.leave.push(weekNumber)
      }
      if (secondaryPay === '1') {
        this.data.secondary.pay.push(weekNumber)
      }
    })
  }
}

function getYesOrNo (binary) {
  return binary === '1' ? 'yes' : 'no'
}

function getSalaryPeriod (periodBinary) {
  switch (periodBinary) {
    case '01':
      return 'week'
    case '10':
      return 'month'
    default:
      return 'year'
  }
}

module.exports = ShareTokenEncoder
