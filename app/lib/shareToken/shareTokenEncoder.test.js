const { describe, it } = require('mocha')
const { expect } = require('chai')

const ShareTokenEncoder = require('./shareTokenEncoder')

describe('shareTokenEncoder', () => {
  describe('#encode', () => {
    it('encodes birth-or-adoption', () => {
      const data = {
        'birth-or-adoption': 'adoption',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        'primary': {
          'leave': [],
          'pay': []
        },
        'secondary': {
          'leave': [],
          'pay': []
        }
      }
      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '1+000+Yhkn+0+0+0+0000000000000000000000000000000000000'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes eligibility', () => {
      const data = {
        'birth-or-adoption': 'birth',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        'primary': {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'maternity-allowance-eligible': 'yes',
          'leave': [],
          'pay': []
        },
        'secondary': {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'yes',
          'leave': [],
          'pay': []
        }
      }
      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+kFx+Yhkn+0+0+0+0000000000000000000000000000000000000000000'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes the start date', () => {
      const data = {
        'birth-or-adoption': 'birth',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        primary: {
          'leave': [],
          'pay': []
        },
        secondary: {
          'leave': [],
          'pay': []
        }
      }
      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+000+Yhkn+0+0+0+0000000000000000000000000000000000000000000'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes salary information', () => {
      const data = {
        'birth-or-adoption': 'birth',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        'primary': {
          'leave': [],
          'pay': [],
          'salary-amount': '35250',
          'salary-period': 'year'
        },
        'secondary': {
          'leave': [],
          'pay': [],
          'salary-amount': '28799',
          'salary-period': 'month'
        }
      }
      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+000+Yhkn+18co+171_+E+0000000000000000000000000000000000000000000'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes weeks', () => {
      const data = {
        'birth-or-adoption': 'birth',
        'start-date-day': '09',
        'start-date-month': '09',
        'start-date-year': '2017',
        'primary': {
          'leave': ['-11', '-10', '-9', '-8', '-7', '-3', '-2', '-1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '34', '35', '36', '38', '39', '40', '41', '52', '0', '1'],
          'pay': ['-11', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '28', '29', '30', '31', '32', '33', '34', '35', '36', '39', '40', '41', '52']
        },
        'secondary': {
          'leave': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '13', '15', '16', '20', '21', '22', '25', '26', '27', '28', '29'],
          'pay': ['0', '2', '4', '6', '8', '10', '12', '14', '15', '16', '17', '19', '21']
        }
      }
      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+000+Yhkn+0+0+0+o8Y008YBh-_luy_FxN_Stlg8ggxiH4pC2Cp0000000m'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes a complex data object', () => {
      const data = {
        'birth-or-adoption': 'birth',
        'start-date-day': '2',
        'start-date-month': '10',
        'start-date-year': '18',
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
          'salary-amount': '09870987',
          'salary-period': 'month'
        }
      }

      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+kFx+81C2+14i3pD+1bfwB+E+o8Y8Y8YBh-_luy_lx__y_lxCxkxipCpCpCp0000000y'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })

    it('encodes another complex data object', () => {
      const data = {
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

      const shareTokenEncoder = new ShareTokenEncoder(data)
      const expected = '0+y3m+Yhkp+1vIs+1cz+D+pCpCpCpCm0CpCm0CpCp00pCp000000038Y8iY8Y0030'

      expect(shareTokenEncoder.encode(data)).to.equal(expected)
    })
  })
})
