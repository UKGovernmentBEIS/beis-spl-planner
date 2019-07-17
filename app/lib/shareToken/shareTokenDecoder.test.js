const { describe, it } = require('mocha')
const { expect } = require('chai')

const ShareTokenDecoder = require('./shareTokenDecoder')

describe('ShareTokenDecoder', () => {
  describe('#decode', () => {
    it('decodes birth-or-adoption', () => {
      const encoded = '0+000+Yhkn+0+0+0+0000000000000000000000'
      const shareTokenDecoder = new ShareTokenDecoder(encoded)
      const result = shareTokenDecoder.decode()

      expect(result['birth-or-adoption']).to.deep.equal('birth')
    })

    it('decodes eligibility', () => {
      const encoded = '0+kFx+Yhkn+0+0+0+0000000000000000000000'
      const expected = {
        'birth-or-adoption': 'birth',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        primary: {
          'leave': [],
          'pay': [],
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'maternity-allowance-eligible': 'yes'
        },
        secondary: {
          'leave': [],
          'pay': [],
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'yes'
        }
      }
      const shareTokenDecoder = new ShareTokenDecoder(encoded)

      expect(shareTokenDecoder.decode()).to.deep.equal(expected)
    })

    it('decodes start date', () => {
      const encoded = '0+000+Yhkn+0+0+0+0000000000000000000000'
      const expectedDay = '09'
      const expectedMonth = '09'
      const expectedYear = '2017'

      const shareTokenDecoder = new ShareTokenDecoder(encoded)
      const result = shareTokenDecoder.decode()

      expect(result['start-date-day']).to.equal(expectedDay)
      expect(result['start-date-month']).to.equal(expectedMonth)
      expect(result['start-date-year']).to.equal(expectedYear)
    })

    it('decodes salary information', () => {
      const encoded = '0+000+Yhkn+18co+171_+E+0000000000000000000000'
      const expectedPrimarySalary = '35250'
      const expectedSecondarySalary = '28799'
      const expectedPrimaryPeriod = 'year'
      const expectedSecondaryPeriod = 'month'

      const shareTokenDecoder = new ShareTokenDecoder(encoded)
      const result = shareTokenDecoder.decode()

      expect(result.primary['salary-amount']).to.equal(expectedPrimarySalary)
      expect(result.primary['salary-period']).to.equal(expectedPrimaryPeriod)
      expect(result.secondary['salary-amount']).to.equal(expectedSecondarySalary)
      expect(result.secondary['salary-period']).to.equal(expectedSecondaryPeriod)
    })

    it('decodes weeks', () => {
      const encoded = '0+000+Yhkn+0+0+0+o8Y008YBh-_luy_FxN_Stlg8ggxiH4pC2Cp0000000m'
      const expectedPrimaryLeave = ['-11', '-10', '-9', '-8', '-7', '-3', '-2', '-1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '34', '35', '36', '38', '39', '40', '41', '52', '0', '1']
      const expectedPrimaryPay = ['-11', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '28', '29', '30', '31', '32', '33', '34', '35', '36', '39', '40', '41', '52']
      const expectedSecondaryLeave = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '13', '15', '16', '20', '21', '22', '25', '26', '27', '28', '29']
      const expectedSecondaryPay = ['0', '2', '4', '6', '8', '10', '12', '14', '15', '16', '17', '19', '21']

      const shareTokenDecoder = new ShareTokenDecoder(encoded)
      const result = shareTokenDecoder.decode()

      expect(result.primary.leave).to.have.members(expectedPrimaryLeave)
      expect(result.primary.pay).to.have.members(expectedPrimaryPay)
      expect(result.secondary.leave).to.have.members(expectedSecondaryLeave)
      expect(result.secondary.pay).to.have.members(expectedSecondaryPay)
    })

    it('decodes a complex data object', () => {
      const encoded = '0+kFx+81C2+14i3pD+1bfwB+E+o8Y8Y8YBh-_luy_lx__y_lxCxkxipCpCpCp0000000y'
      const expected = {
        'birth-or-adoption': 'birth',
        'start-date-day': '02',
        'start-date-month': '10',
        'start-date-year': '2018',
        'primary': {
          'maternity-allowance-eligible': 'yes',
          'leave': ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '52', '0', '1'],
          'pay': ['-11', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '52'],
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'salary-amount': '78658765',
          'salary-period': 'year'
        },
        'secondary': {
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'yes',
          'leave': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12', '13', '14', '15', '16', '17', '19', '20', '21', '22', '25', '26', '27', '28', '29', '52'],
          'pay': ['0', '2', '4', '6', '8', '10', '12', '14', '15', '16', '17', '19', '21', '52'],
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '9870987',
          'salary-period': 'month'
        }
      }
      const result = new ShareTokenDecoder(encoded).decode()
      expect(result['birth-or-adoption']).to.equal(expected['birth-or-adoption'])
      expect(result['start-date-day']).to.equal(expected['start-date-day'])
      expect(result['start-date-month']).to.equal(expected['start-date-month'])
      expect(result['start-date-year']).to.equal(expected['start-date-year'])
      expect(result.primary['spl-eligible']).to.equal(expected.primary['spl-eligible'])
      expect(result.primary['shpp-eligible']).to.equal(expected.primary['shpp-eligible'])
      expect(result.primary['salary-amount']).to.equal(expected.primary['salary-amount'])
      expect(result.primary['salary-period']).to.equal(expected.primary['salary-period'])
      expect(result.secondary['spl-eligible']).to.equal(expected.secondary['spl-eligible'])
      expect(result.secondary['shpp-eligible']).to.equal(expected.secondary['shpp-eligible'])
      expect(result.secondary['salary-amount']).to.equal(expected.secondary['salary-amount'])
      expect(result.secondary['salary-period']).to.equal(expected.secondary['salary-period'])
      expect(result.primary.pay).to.have.members(expected.primary.pay)
      expect(result.primary.leave).to.have.members(expected.primary.leave)
      expect(result.secondary.pay).to.have.members(expected.secondary.pay)
      expect(result.secondary.leave).to.have.members(expected.secondary.leave)
    })

    it('decodes another complex data object', () => {
      const encoded = '0+y3m+Yhkp+1vIs+1cz+D+pCpCpCpCm0CpCm0CpCp00pCp000000038Y8iY8Y0030'
      const expected = {
        'birth-or-adoption': 'birth',
        'primary': {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '234678',
          'salary-period': 'year',
          'leave': ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '12', '13', '14', '15', '16', '17', '42', '43', '44', '45', '46', '47', '0', '1'],
          'pay': ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '0', '1', '12', '13', '14', '15', '16', '17', '42']
        },
        'secondary': {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '2493',
          'salary-period': 'week',
          'leave': ['4', '5', '6', '7', '8', '20', '21', '22', '23', '24', '36', '37', '38', '39', '40', '41', '51'],
          'pay': ['4', '5', '6', '7', '8', '20', '21', '22', '23', '24', '36', '51']
        },
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2019'
      }
      const result = new ShareTokenDecoder(encoded).decode()
      expect(result['birth-or-adoption']).to.equal(expected['birth-or-adoption'])
      expect(result['start-date-day']).to.equal(expected['start-date-day'])
      expect(result['start-date-month']).to.equal(expected['start-date-month'])
      expect(result['start-date-year']).to.equal(expected['start-date-year'])
      expect(result.primary['spl-eligible']).to.equal(expected.primary['spl-eligible'])
      expect(result.primary['shpp-eligible']).to.equal(expected.primary['shpp-eligible'])
      expect(result.primary['salary-amount']).to.equal(expected.primary['salary-amount'])
      expect(result.primary['salary-period']).to.equal(expected.primary['salary-period'])
      expect(result.secondary['spl-eligible']).to.equal(expected.secondary['spl-eligible'])
      expect(result.secondary['shpp-eligible']).to.equal(expected.secondary['shpp-eligible'])
      expect(result.secondary['salary-amount']).to.equal(expected.secondary['salary-amount'])
      expect(result.secondary['salary-period']).to.equal(expected.secondary['salary-period'])
      expect(result.primary.pay).to.have.members(expected.primary.pay)
      expect(result.primary.leave).to.have.members(expected.primary.leave)
      expect(result.secondary.pay).to.have.members(expected.secondary.pay)
      expect(result.secondary.leave).to.have.members(expected.secondary.leave)
    })
  })
})
