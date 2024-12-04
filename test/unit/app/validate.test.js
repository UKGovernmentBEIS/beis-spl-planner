const { describe, it, xit, beforeEach, afterEach } = require('mocha')
const { expect } = require('chai')
const validate = require('../../../app/validate')

// use a dynamic start date in the past 9 months so the tests don't fail in the future
const startDate = new Date()
startDate.setMonth(startDate.getMonth() - 9)

describe('validate.js', () => {
  let req

  beforeEach(() => {
    req = {
      session: {
        data: {
          'nature-of-parenthood': '',
          'type-of-adoption': '',
          'start-date-year': '',
          'start-date-month': '',
          'start-date-day': '',
          primary: {
            'salary-amount': '',
            'salary-period': ''
          },
          secondary: {
            'salary-amount': '',
            'salary-period': ''
          }
        },
        errors: []
      }
    }
  })

  afterEach(() => {
    req = {
      session: {
        data: {},
        errors: []
      }
    }
  })
  describe('natureOfParenthood', () => {
    it("returns true if request session data 'nature-of-parenthood' contains accepted values", () => {
      const acceptedValues = ['birth', 'adoption', 'surrogacy']

      acceptedValues.forEach((value) => {
        req.session.data['nature-of-parenthood'] = value
        expect(validate.natureOfParenthood(req)).to.equal(true)
      })
    })

    it("returns an error message and false if request session data 'nature-of-parenthood' does not contain accepted values", () => {
      req.session.data['nature-of-parenthood'] = 'test'
      expect(validate.natureOfParenthood(req)).to.equal(false)

      const error = req.session.errors['nature-of-parenthood']

      expect(error.text).to.equal('Select either birth, adoption or surrogacy')
      expect(error.href).to.equal('#nature-of-parenthood')
    })
  })
  describe('typeOfAdoption', () => {
    it("returns true if request session data 'type-of-adoption' contains accepted values", () => {
      const acceptedValues = ['uk', 'overseas']

      acceptedValues.forEach((value) => {
        req.session.data['type-of-adoption'] = value
        expect(validate.typeOfAdoption(req)).to.equal(true)
      })
    })

    it("returns an error message and false if request session data 'type-of-adoption' does not contain accepted values", () => {
      req.session.data['nature-of-parenthood'] = 'adoption'
      req.session.data['type-of-adoption'] = 'test'

      expect(validate.typeOfAdoption(req)).to.equal(false)

      const error = req.session.errors['type-of-adoption']
      expect(error.text).to.equal('Select either UK or overseas adoption')
      expect(error.href).to.equal('#type-of-adoption')
    })
  })
  describe('primarySharedParentalLeaveAndPay', () => {
    it("returns true if 'spl-eligible' and 'shpp-eligible' contain valid values", () => {
      req.session.data.primary = {
        'spl-eligible': 'yes',
        'shpp-eligible': 'yes'
      }
      expect(validate.primarySharedParentalLeaveAndPay(req)).to.equal(true)

      req.session.data.primary = {
        'spl-eligible': 'no',
        'shpp-eligible': 'no'
      }
      expect(validate.primarySharedParentalLeaveAndPay(req)).to.equal(true)
    })
  })
  describe('initialLeaveAndPay', () => {
    const validCombinations = [
      {
        'spl-eligible': 'yes',
        'shpp-eligible': 'yes',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'no',
        'shpp-eligible': 'yes',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'yes',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'no',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      }
    ]

    const checkValidCombination = (combination) => {
      req.session.data.primary = combination
      expect(validate.initialLeaveAndPay(req)).to.equal(true)
    }

    validCombinations.forEach((combination, index) => {
      it(`returns true for valid combination #${index + 1}`, () => {
        checkValidCombination(combination)
      })
    })

    const checkInvalidCombination = (combination, expectedError) => {
      req.session.data.primary = combination
      expect(validate.initialLeaveAndPay(req)).to.equal(false)

      const error = req.session.errors[expectedError.field]
      expect(error.text).to.equal(expectedError.text)
      expect(error.href).to.equal(expectedError.href)
    }

    it("returns false and adds an error if SPL is 'no' and initial leave eligibility is invalid", () => {
      checkInvalidCombination(
        {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'invalid',
          'initial-pay-eligible': 'yes'
        },
        {
          field: 'initial-leave-eligible',
          text: 'Select whether you are eligible for leave',
          href: '#primary-initial-leave-eligible'
        }
      )
    })

    it("returns false and adds an error if SHPP is 'no' and initial pay eligibility is invalid", () => {
      checkInvalidCombination(
        {
          'spl-eligible': 'yes',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'yes',
          'initial-pay-eligible': 'invalid'
        },
        {
          field: 'initial-pay-eligible',
          text: 'Select whether you are eligible for pay',
          href: '#primary-initial-pay-eligible'
        }
      )
    })

    it("returns false and adds errors if both SPL and SHPP are 'no' and initial fields are invalid", () => {
      req.session.data.primary = {
        'spl-eligible': 'no',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'invalid',
        'initial-pay-eligible': 'invalid'
      }
      expect(validate.initialLeaveAndPay(req)).to.equal(false)

      const leaveError = req.session.errors['initial-leave-eligible']
      expect(leaveError.text).to.equal(
        'Select whether you are eligible for leave'
      )
      expect(leaveError.href).to.equal('#primary-initial-leave-eligible')

      const payError = req.session.errors['initial-pay-eligible']
      expect(payError.text).to.equal('Select whether you are eligible for pay')
      expect(payError.href).to.equal('#primary-initial-pay-eligible')
    })
  })

  describe('maternityAllowance', () => {
    it('returns true if skip function returns true', () => {
      req.session.data = {
        primary: {
          'maternity-allowance-eligible': 'yes'
        }
      }
      expect(validate.maternityAllowance(req)).to.equal(true)
    })

    it("returns true if 'maternity-allowance-eligible' is 'yes' or 'no'", () => {
      const validResponses = ['yes', 'no']

      validResponses.forEach((response) => {
        req.session.data = {
          primary: {
            'maternity-allowance-eligible': response
          }
        }
        expect(validate.maternityAllowance(req)).to.equal(true)
      })
    })

    it("returns false and adds an error if 'maternity-allowance-eligible' is not 'yes' or 'no'", () => {
      req.session.data = {
        primary: {
          'maternity-allowance-eligible': 'invalid'
        }
      }
      expect(validate.maternityAllowance(req)).to.equal(false)

      const error = req.session.errors['maternity-allowance-eligible']
      expect(error.text).to.equal(
        'Select whether you are eligible for Maternity Allowance'
      )
      expect(error.href).to.equal('#maternity-allowance-eligible')
    })

    it("returns false and adds an error if 'maternity-allowance-eligible' is missing", () => {
      req.session.data = {
        primary: {}
      }
      expect(validate.maternityAllowance(req)).to.equal(false)

      const error = req.session.errors['maternity-allowance-eligible']
      expect(error.text).to.equal(
        'Select whether you are eligible for Maternity Allowance'
      )
      expect(error.href).to.equal('#maternity-allowance-eligible')
    })
  })
  describe('secondarySharedParentalLeaveAndPay', () => {
    it("returns true if 'spl-eligible' and 'shpp-eligible' contain valid values", () => {
      req.session.data.secondary = {
        'spl-eligible': 'yes',
        'shpp-eligible': 'yes'
      }
      expect(validate.secondarySharedParentalLeaveAndPay(req)).to.equal(true)

      req.session.data.secondary = {
        'spl-eligible': 'no',
        'shpp-eligible': 'no'
      }
      expect(validate.secondarySharedParentalLeaveAndPay(req)).to.equal(true)
    })
  })

  describe('paternityLeaveAndPay', () => {
    const validCombinations = [
      {
        'spl-eligible': 'yes',
        'shpp-eligible': 'yes',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'no',
        'shpp-eligible': 'yes',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'yes',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      },
      {
        'spl-eligible': 'no',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'yes',
        'initial-pay-eligible': 'yes'
      }
    ]

    const checkValidCombination = (combination) => {
      req.session.data.secondary = combination
      expect(validate.paternityLeaveAndPay(req)).to.equal(true)
    }

    validCombinations.forEach((combination, index) => {
      it(`returns true for valid combination #${index + 1}`, () => {
        checkValidCombination(combination)
      })
    })

    const checkInvalidCombination = (combination, expectedError) => {
      req.session.data.secondary = combination
      expect(validate.paternityLeaveAndPay(req)).to.equal(false)

      const error = req.session.errors[expectedError.field]
      expect(error.text).to.equal(expectedError.text)
      expect(error.href).to.equal(expectedError.href)
    }

    it("returns false and adds an error if SPL is 'no' and initial leave eligibility is invalid", () => {
      checkInvalidCombination(
        {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'invalid',
          'initial-pay-eligible': 'yes'
        },
        {
          field: 'initial-leave-eligible',
          text: 'Select whether you are eligible for leave',
          href: '#initial-leave-eligible'
        }
      )
    })

    it("returns false and adds an error if SHPP is 'no' and initial pay eligibility is invalid", () => {
      checkInvalidCombination(
        {
          'spl-eligible': 'yes',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'yes',
          'initial-pay-eligible': 'invalid'
        },
        {
          field: 'initial-pay-eligible',
          text: 'Select whether you are eligible for pay',
          href: '#initial-pay-eligible'
        }
      )
    })

    it("returns false and adds errors if both SPL and SHPP are 'no' and initial fields are invalid", () => {
      req.session.data.secondary = {
        'spl-eligible': 'no',
        'shpp-eligible': 'no',
        'initial-leave-eligible': 'invalid',
        'initial-pay-eligible': 'invalid'
      }
      expect(validate.paternityLeaveAndPay(req)).to.equal(false)

      const leaveError = req.session.errors['initial-leave-eligible']
      expect(leaveError.text).to.equal(
        'Select whether you are eligible for leave'
      )
      expect(leaveError.href).to.equal('#initial-leave-eligible')

      const payError = req.session.errors['initial-pay-eligible']
      expect(payError.text).to.equal('Select whether you are eligible for pay')
      expect(payError.href).to.equal('#initial-pay-eligible')
    })
  })

  describe('startDate', () => {
    it('returns true for a valid date within the permitted range', () => {
      req.session.data['start-date-year'] = '2024'
      req.session.data['start-date-month'] = '10'
      req.session.data['start-date-day'] = '15'

      expect(validate.startDate(req)).to.equal(true)
    })

    it('returns false and adds an error if any date part is missing', () => {
      const testCases = [
        { year: '', month: '10', day: '15', message: 'Enter a valid year' },
        {
          year: startDate.getFullYear(),
          month: '',
          day: startDate.getDate(),
          message: 'Enter a valid month'
        },
        {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: '',
          message: 'Enter a valid day'
        },
        {
          year: '',
          month: '',
          day: '',
          message: 'Enter a valid day, month and year'
        }
      ]

      testCases.forEach(({ year, month, day, message }) => {
        req.session.data['start-date-year'] = year
        req.session.data['start-date-month'] = month
        req.session.data['start-date-day'] = day

        expect(validate.startDate(req)).to.equal(false)
        const error = req.session.errors['start-date']

        expect(error.text).to.equal(message)
      })
    })

    it('returns false and adds an error if the date is invalid', () => {
      req.session.data['start-date-year'] = startDate.getFullYear()
      req.session.data['start-date-month'] = startDate.getMonth() + 1
      req.session.data['start-date-day'] = '41'

      expect(validate.startDate(req)).to.equal(false)
      const error = req.session.errors['start-date']
      expect(error.text).to.equal('Enter a valid day')
    })

    it('returns false and adds an error if the date is outside the permitted range', () => {
      const testCases = [
        {
          year: startDate.getFullYear() - 10,
          month: startDate.getMonth() + 1,
          day: startDate.getDate(),
          message: 'Enter a date within one year of today'
        },
        {
          year: startDate.getFullYear() + 10,
          month: startDate.getMonth() + 1,
          day: startDate.getDate(),
          message: 'Enter a date within one year of today'
        }
      ]

      testCases.forEach(({ year, month, day, message }) => {
        req.session.data['start-date-year'] = year
        req.session.data['start-date-month'] = month
        req.session.data['start-date-day'] = day

        expect(validate.startDate(req)).to.equal(false)
        const error = req.session.errors['start-date']

        expect(error.text).to.equal(message)
      })
    })
  })
  describe('addStartDateError', () => {
    const testCases = [
      {
        message: 'Test error message',
        dateParts: ['year', 'month', 'day'],
        expectedHref: '#start-date-year'
      },
      {
        message: 'Month error',
        dateParts: ['month'],
        expectedHref: '#start-date-month'
      },
      {
        message: 'Day error',
        dateParts: ['day'],
        expectedHref: '#start-date-day'
      },
      {
        message: 'No date parts error',
        dateParts: [],
        expectedHref: '#start-date-undefined'
      }
    ]

    testCases.forEach(({ message, dateParts, expectedHref }) => {
      it(`adds an error with message: "${message}"`, () => {
        validate.addStartDateError(req, message, dateParts)

        const error = req.session.errors['start-date']

        expect(error).to.have.property('text', message)
        expect(error).to.have.property('href', expectedHref)
        expect(error).to.have.property('dateParts').that.deep.equals(dateParts)
      })
    })
  })

  describe('parentSalaries', () => {
    let req

    beforeEach(() => {
      req = {
        method: 'POST',
        session: {
          data: {
            primary: {},
            secondary: {}
          },
          errors: {}
        }
      }
    })

    const setSalaries = (primary = {}, secondary = {}) => {
      req.session.data.primary = primary
      req.session.data.secondary = secondary
    }

    const expectError = (key, expectedText, expectedHref) => {
      const error = req.session.errors[key]
      expect(error).to.have.property('text', expectedText)
      expect(error).to.have.property('href', expectedHref)
    }

    it('should return true if both salaries are valid', () => {
      setSalaries(
        { 'salary-amount': '14000.00', 'salary-period': 'year' },
        { 'salary-amount': '3000', 'salary-period': 'month' }
      )

      const result = validate.parentSalaries(req)
      expect(result).to.equal(true)
    })

    it('should return false with the correct error message if both primary and secondary salary is missing', () => {
      setSalaries(
        { 'salary-amount': '', 'salary-period': 'test' },
        { 'salary-amount': '', 'salary-period': 'test' }
      )

      const result = validate.parentSalaries(req)
      expect(result).to.equal(false)
      expectError(
        'skip-this-question',
        "If you do not want to submit either parent’s salary, click 'Skip this question'",
        '#skip-this-question'
      )
    })

    it('should return false if both salaries and salary periods are invalid or in the wrong format', () => {
      setSalaries(
        { 'salary-amount': 'test', 'salary-period': 'test' },
        { 'salary-amount': 'test', 'salary-period': 'test' }
      )

      const result = validate.parentSalaries(req)
      expect(result).to.equal(false)
    })

    describe('primary salary', () => {
      it('should return false if the primary salary is in the wrong format', () => {
        setSalaries({ 'salary-amount': '1ab24', 'salary-period': 'year' })

        const result = validate.parentSalaries(req)
        expect(result).to.equal(false)
        expectError(
          'primary-salary-amount',
          'Salary must be an amount of money like 23000 or 139.45',
          '#primary-salary-amount'
        )
      })

      it('should return false if the primary salary period is not an accepted string', () => {
        setSalaries({
          'salary-amount': '10000.00',
          'salary-period': 'century'
        })

        const result = validate.parentSalaries(req)
        expect(result).to.equal(false)
        expectError(
          'primary-salary-period',
          'Salary period must be week, month or year',
          '#primary-salary-period'
        )
      })
    })

    describe('secondary salary', () => {
      it('should return false if the secondary salary is in the wrong format', () => {
        setSalaries({}, { 'salary-amount': '1ab24', 'salary-period': 'year' })

        const result = validate.parentSalaries(req)
        expect(result).to.equal(false)
        expectError(
          'secondary-salary-amount',
          'Salary must be an amount of money like 23000 or 139.45',
          '#secondary-salary-amount'
        )
      })

      it('should return false if the secondary salary period is not an accepted string', () => {
        setSalaries(
          {},
          { 'salary-amount': '10000.00', 'salary-period': 'century' }
        )

        const result = validate.parentSalaries(req)
        expect(result).to.equal(false)
        expectError(
          'secondary-salary-period',
          'Salary period must be week, month or year',
          '#secondary-salary-period'
        )
      })
    })
  })
  describe('hasBreakBeforeEnd', () => {
    it('should return true if there is a break between weeks', () => {
      const weeks = [1, 2, 4, 5]
      const end = 5
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(true)
    })

    it('should return false if all weeks are continuous up to the end', () => {
      const weeks = [1, 2, 3, 4]
      const end = 4
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(false)
    })

    it('should return false if weeks exceed the end', () => {
      const weeks = [1, 2, 3, 5]
      const end = 4
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(false)
    })

    it('should return false if there are no weeks', () => {
      const weeks = []
      const end = 4
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(false)
    })

    it('should return false if the last week is less than the end', () => {
      const weeks = [1, 2, 3]
      const end = 4
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(false)
    })

    it('should return true if the weeks have a break at the start', () => {
      const weeks = [3, 4, 5, 7]
      const end = 7
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(true)
    })

    it('should return true if there is a break in the middle and still within the end', () => {
      const weeks = [1, 3, 4, 5]
      const end = 5
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(true)
    })

    it('should return false if weeks only contain one value less than end', () => {
      const weeks = [1]
      const end = 2
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(false)
    })

    it('should return true if the weeks have a break at the end', () => {
      const weeks = [1, 2, 3, 5]
      const end = 5
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(true)
    })

    it('should return true if weeks are in descending order but have a break', () => {
      const weeks = [5, 4, 2, 1]
      const end = 5
      const result = validate.hasBreakBeforeEnd(weeks, end)
      expect(result).to.equal(true)
    })
  })
  describe('getLeaveWeeksCount', () => {
    const primaryTypes = ['maternity', 'shared']
    const secondaryTypes = ['paternity', 'shared']

    it('should return 0 if there are no weeks', () => {
      const weeks = []
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(0)
    })

    it('should return 0 if no leave is eligible', () => {
      const weeks = [
        {
          primary: { leave: { eligible: false, text: 'maternity' } },
          secondary: { leave: { eligible: false, text: 'paternity' } }
        }
      ]
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(0)
    })

    it('should return the correct count of eligible leave weeks for both parents', () => {
      const weeks = [
        {
          primary: { leave: { eligible: true, text: 'maternity' } },
          secondary: { leave: { eligible: true, text: 'paternity' } }
        },
        {
          primary: { leave: { eligible: true, text: 'shared' } },
          secondary: { leave: { eligible: false, text: 'paternity' } }
        },
        {
          primary: { leave: { eligible: false, text: 'maternity' } },
          secondary: { leave: { eligible: true, text: 'shared' } }
        }
      ]
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(4)
    })

    it('should count leave only from eligible weeks', () => {
      const weeks = [
        {
          primary: { leave: { eligible: true, text: 'maternity' } },
          secondary: { leave: { eligible: false, text: 'paternity' } }
        },
        {
          primary: { leave: { eligible: false, text: 'shared' } },
          secondary: { leave: { eligible: true, text: 'shared' } }
        }
      ]
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(2)
    })

    it('should handle leave types that are not in the list', () => {
      const weeks = [
        {
          primary: { leave: { eligible: true, text: 'maternity' } },
          secondary: { leave: { eligible: true, text: 'shared' } }
        }
      ]
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(2)
    })

    it('should count eligible leaves for multiple leave types', () => {
      const weeks = [
        {
          primary: { leave: { eligible: true, text: 'maternity' } },
          secondary: { leave: { eligible: true, text: 'shared' } }
        },
        {
          primary: { leave: { eligible: true, text: 'shared' } },
          secondary: { leave: { eligible: true, text: 'paternity' } }
        }
      ]
      const result = validate.getLeaveWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(4)
    })

    it('should return 0 if leave types list is empty', () => {
      const weeks = [
        {
          primary: { leave: { eligible: true, text: 'maternity' } },
          secondary: { leave: { eligible: true, text: 'shared' } }
        }
      ]
      const types = []
      const result = validate.getLeaveWeeksCount(weeks, types)
      expect(result).to.equal(0)
    })
  })

  describe('getPayWeeksCount', () => {
    const primaryTypes = ['maternity', 'shared']
    const secondaryTypes = ['paternity', 'shared']

    it('should return 0 if there are no weeks', () => {
      const weeks = []
      const result = validate.getPayWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(0)
    })

    it('should return 0 if no pay is eligible', () => {
      const weeks = [
        {
          primary: {
            leave: { eligible: false, text: 'maternity' },
            pay: { eligible: false, text: '' }
          },
          secondary: {
            leave: { eligible: false, text: 'paternity' },
            pay: { eligible: false, text: '' }
          }
        }
      ]
      const result = validate.getPayWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(0)
    })

    it('should return the correct count of eligible pay weeks for both parents', () => {
      const weeks = [
        {
          primary: {
            leave: { eligible: true, text: 'maternity' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: true, text: 'paternity' },
            pay: { eligible: true, text: 'paid' }
          }
        },
        {
          primary: {
            leave: { eligible: true, text: 'shared' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: false, text: 'paternity' },
            pay: { eligible: true, text: 'paid' }
          }
        },
        {
          primary: {
            leave: { eligible: false, text: 'maternity' },
            pay: { eligible: true, text: 'unpaid' }
          },
          secondary: {
            leave: { eligible: true, text: 'shared' },
            pay: { eligible: false, text: '' }
          }
        }
      ]
      const result = validate.getPayWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(5)
    })

    it('should count pay only from eligible weeks with pay text', () => {
      const weeks = [
        {
          primary: {
            leave: { eligible: true, text: 'maternity' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: true, text: 'paternity' },
            pay: { eligible: false, text: '' }
          }
        },
        {
          primary: {
            leave: { eligible: false, text: 'shared' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: true, text: 'paternity' },
            pay: { eligible: true, text: '' }
          }
        }
      ]
      const result = validate.getPayWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(2)
    })

    it('should handle leave types that are not in the list', () => {
      const weeks = [
        {
          primary: {
            leave: { eligible: true, text: 'maternity' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: true, text: 'shared' },
            pay: { eligible: true, text: 'paid' }
          }
        }
      ]
      const result = validate.getPayWeeksCount(weeks, [
        ...primaryTypes,
        ...secondaryTypes
      ])
      expect(result).to.equal(2)
    })

    it('should return 0 if leave types list is empty', () => {
      const weeks = [
        {
          primary: {
            leave: { eligible: true, text: 'maternity' },
            pay: { eligible: true, text: 'paid' }
          },
          secondary: {
            leave: { eligible: true, text: 'shared' },
            pay: { eligible: true, text: 'paid' }
          }
        }
      ]
      const types = []
      const result = validate.getPayWeeksCount(weeks, types)
      expect(result).to.equal(0)
    })
  })

  describe('addCalendarError', () => {
    const testCases = [
      {
        parentOrShared: 'primary',
        key: 'test-key',
        message: 'Test error message',
        expectedErrorKey: 'calendar.primary.test-key',
        expectedHref: '#leave-and-pay'
      },
      {
        parentOrShared: 'secondary',
        key: 'another-key',
        message: 'Another error message',
        expectedErrorKey: 'calendar.secondary.another-key',
        expectedHref: '#leave-and-pay'
      },
      {
        parentOrShared: 'shared',
        key: 'shared-key',
        message: 'Shared error message',
        expectedErrorKey: 'calendar.shared.shared-key',
        expectedHref: '#leave-and-pay'
      }
    ]

    testCases.forEach(
      ({ parentOrShared, key, message, expectedErrorKey, expectedHref }) => {
        it(`adds a calendar error for ${parentOrShared} with message: "${message}"`, () => {
          validate.addCalendarError(req, parentOrShared, key, message)

          const error = req.session.errors[expectedErrorKey]

          expect(error).to.have.property('text', message)
          expect(error).to.have.property('href', expectedHref)
        })
      }
    )
  })
  describe('paternityLeaveQuestion', () => {
    it('should return false and add an error if secondary leaves are undefined', () => {
      req.session.data['leave-blocks'] = {
        secondary: undefined
      }

      const result = validate.paternityLeaveQuestion(req)
      expect(result).to.equal(false)

      const error = req.session.errors['is-taking-paternity-leave']
      expect(error).to.have.property(
        'text',
        ' Select whether or not the Partner will take Paternity Leave'
      )
      expect(error).to.have.property('href', '#is-taking-paternity-leave')
    })

    it('should return false and add an error if is-taking-paternity-leave is not a yes or no response', () => {
      req.session.data['leave-blocks'] = {
        secondary: {
          'is-taking-paternity-leave': 'maybe'
        }
      }

      const result = validate.paternityLeaveQuestion(req)
      expect(result).to.equal(false)

      const error = req.session.errors['is-taking-paternity-leave']
      expect(error).to.have.property(
        'text',
        ' Select whether or not the Partner will take Paternity Leave'
      )
      expect(error).to.have.property('href', '#is-taking-paternity-leave')
    })

    it('should return true if is-taking-paternity-leave is yes', () => {
      req.session.data['leave-blocks'] = {
        secondary: {
          'is-taking-paternity-leave': 'yes'
        }
      }

      const result = validate.paternityLeaveQuestion(req)
      expect(result).to.equal(true)
    })

    it('should return true if is-taking-paternity-leave is no', () => {
      req.session.data['leave-blocks'] = {
        secondary: {
          'is-taking-paternity-leave': 'no'
        }
      }

      const result = validate.paternityLeaveQuestion(req)
      expect(result).to.equal(true)
    })
  })
  describe('splQuestions', () => {
    it('should return false and add an error if is-taking-spl-or-done is undefined', () => {
      req.session.data['leave-blocks'] = {}

      const result = validate.splQuestions(req)
      expect(result).to.equal(false)

      const error = req.session.errors['shared-parental-leave']
      expect(error).to.have.property(
        'text',
        'Select whether you want to take Shared Parental Leave or finish'
      )
      expect(error).to.have.property('href', '#shared-parental-leave')
    })

    it('should return true if is-taking-spl-or-done is defined', () => {
      req.session.data['leave-blocks'] = {
        'is-taking-spl-or-done': 'yes'
      }

      const result = validate.splQuestions(req)
      expect(result).to.equal(true)
    })
  })
  describe('feedback', () => {
    it('should return false and add an error if feedback is missing', () => {
      req.session.data = {
        feedback: '',
        'spam-filter': 'yes'
      }

      const result = validate.feedback(req)
      expect(result).to.equal(false)

      const error = req.session.errors.feedback
      expect(error).to.have.property(
        'text',
        'Provide your experience with the service.'
      )
      expect(error).to.have.property('href', '#feedback')
    })

    it('should return false and add an error if spam-filter is missing', () => {
      req.session.data = {
        feedback: 'Great service!',
        'spam-filter': ''
      }

      const result = validate.feedback(req)
      expect(result).to.equal(false)

      const error = req.session.errors['spam-filter']
      expect(error).to.have.property('text', 'Prove you are not a robot.')
      expect(error).to.have.property('href', '#spam-filter')
    })

    it('should return false and add an error if spam-filter value is incorrect', () => {
      req.session.data = {
        feedback: 'Great service!',
        'spam-filter': 'no'
      }

      const result = validate.feedback(req)
      expect(result).to.equal(false)

      const error = req.session.errors['spam-filter']
      expect(error).to.have.property(
        'text',
        'The value you entered was incorrect. Please try again.'
      )
      expect(error).to.have.property('href', '#spam-filter')
    })

    it('should return false if url is provided in feedback', () => {
      req.session.data = {
        url: 'www.bot-test.com',
        feedback: 'Great service!',
        'spam-filter': 'yes'
      }

      const result = validate.feedback(req)
      expect(result).to.equal(false)
    })

    it('should return true if feedback is provided and spam-filter value is valid', () => {
      req.session.data = {
        feedback: 'Great service!',
        'spam-filter': 'yes'
      }

      const result = validate.feedback(req)
      expect(result).to.equal(true)
    })

    it('should return true if spam-filter value is "yes."', () => {
      req.session.data = {
        feedback: 'Great service!',
        'spam-filter': 'yes.'
      }

      const result = validate.feedback(req)
      expect(result).to.equal(true)
    })
  })

  describe('planner', () => {
    xit('skip', () => {})
  })
})
