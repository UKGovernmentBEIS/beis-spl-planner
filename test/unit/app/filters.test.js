const { describe, it } = require('mocha')
const { expect } = require('chai')
const Day = require('../../../common/lib/day')

const mockEnv = {
  getFilter: (name) => {
    if (name === 'isBirth') return (data) => data.isBirth || false
    if (name === 'offsetWeeks') return (day, weeks) => day.addWeeks(weeks)
    return undefined
  }
}

const filters = require('../../../app/filters')(mockEnv)

// use a dynamic start date in the past 9 months so the tests don't fail in the future
const startDate = new Date()
startDate.setMonth(startDate.getMonth() - 9)

// Constants for test data
const filledLeaveBlocksData = require('../../data/filledLeaveBlocks.json')
const baseData = {
  '?data-in-query': 'true',
  backPathForHelpPages: '/planner',
  'nature-of-parenthood': 'birth',
  primary: {
    'spl-eligible': 'yes',
    'shpp-eligible': 'yes',
    leave: ['0', '1'],
    pay: ['0', '1']
  },
  secondary: {
    'spl-eligible': 'yes',
    'shpp-eligible': 'yes'
  },
  'start-date-day': startDate.getDate(),
  'start-date-month': startDate.getMonth() + 1,
  'start-date-year': startDate.getFullYear(),
  visualPlanner: true
}

const errorWithDayPart = { 'start-date': { dateParts: ['day'] } }
const errorWithMonthPart = { 'start-date': { dateParts: ['month'] } }
const calendarError = { 'calendar.1': 'error' }
const nonCalendarError = { 'other-error': 'error' }

const primarySalaryPresent = { primary: { 'salary-amount': 50000 } }
const noSalary = { primary: {}, secondary: {} }

const totalPayBlock = {
  start: 0,
  end: 4,
  primary: '£1000',
  secondary: '£500'
}

describe('filters.js', () => {
  describe('hasStartDateError', () => {
    it('should return true if start-date error exists for a specific date part', () => {
      expect(filters.hasStartDateError(errorWithDayPart, 'day')).to.equal(true)
    })

    it('should return false if there is no start-date error for the specified date part', () => {
      expect(filters.hasStartDateError(errorWithMonthPart, 'day')).to.equal(
        false
      )
    })
  })

  describe('hasCalendarError', () => {
    it("should return true if any error key starts with 'calendar.'", () => {
      expect(filters.hasCalendarError(calendarError)).to.equal(true)
    })

    it("should return false if no error keys start with 'calendar.'", () => {
      expect(filters.hasCalendarError(nonCalendarError)).to.equal(false)
    })
  })

  describe('isWeekChecked', () => {
    it('should return true if the specified week is in the weeks array', () => {
      const result = filters.isWeekChecked(baseData, 'primary', 'leave', 1)
      expect(result).to.equal(true)
    })

    it('should return false if the specified week is not in the weeks array', () => {
      const result = filters.isWeekChecked(baseData, 'primary', 'leave', 2)
      expect(result).to.equal(false)
    })
  })

  describe('startDay', () => {
    it('should return a Day instance with the given start date', () => {
      const day = filters.startDay(baseData)

      const expectedDay = startDate.getDate()
      const expectedMonth = startDate.getMonth() + 1
      const expectedYear = startDate.getFullYear()

      expect(day).to.be.instanceOf(Day)
      expect(day.date()).to.equal(expectedDay)
      expect(day.monthOneIndexed()).to.equal(expectedMonth)
      expect(day.year()).to.equal(expectedYear)
    })
  })

  describe('startOfWeek', () => {
    it('should return the Monday start of the week for a given day', () => {
      const day = new Day(2024, 10, 23)
      const startOfWeek = filters.startOfWeek(day)
      expect(startOfWeek.moment.isoWeekday()).to.equal(1)
    })
  })

  describe('endOfWeek', () => {
    it('should return the Sunday end of the week for a given day', () => {
      const day = new Day(2024, 10, 23)
      const endOfWeek = filters.endOfWeek(day)
      expect(endOfWeek.moment.isoWeekday()).to.equal(7)
    })
  })

  describe('startDateName', () => {
    it("should return 'due date' if the event is birth", () => {
      const data = { isBirth: true }
      expect(filters.startDateName(data)).to.equal('due date')
    })

    it("should return 'placement date' if the event is not birth", () => {
      const data = { isBirth: false }
      expect(filters.startDateName(data)).to.equal('placement date')
    })
  })

  describe('hasEitherSalary', () => {
    it('should return true if primary or secondary salary is provided', () => {
      expect(filters.hasEitherSalary(primarySalaryPresent)).to.equal(true)
    })

    it('should return false if neither salary is provided', () => {
      expect(filters.hasEitherSalary(noSalary)).to.equal(false)
    })
  })

  describe('zeroWeek', () => {
    it('should return the start of the week (Monday) for the given start date', () => {
      const expectedStartDay = new Day(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate()
      )

      const expectedStartOfWeek = expectedStartDay.mondayStartOfWeek()

      const result = filters.zeroWeek(baseData)

      expect(result.year()).to.equal(expectedStartOfWeek.year())
      expect(result.monthOneIndexed()).to.equal(
        expectedStartOfWeek.monthOneIndexed()
      )
      expect(result.date()).to.equal(expectedStartOfWeek.date())
    })
  })

  describe('totalBlockPay', () => {
    it('should return the total pay amount formatted as a string', () => {
      expect(filters.totalBlockPay(totalPayBlock)).to.equal('£1500.00')
    })
  })

  describe('numberAsString', () => {
    it('should return the count of week as a string', () => {
      const payBlock = {
        ...totalPayBlock,
        start: 10,
        end: 20
      }
      const result = filters.numberAsString(payBlock)

      expect(result).to.eq('11')
    })
  })
  describe('displayPayBlockTotal', () => {
    it('should return true if primary statutory pay is present and salaries are numbers', () => {
      const data = {
        ...baseData,
        primary: {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '30000',
          'salary-period': 'year'
        },
        secondary: {
          'salary-amount': '25000',
          'salary-period': 'year'
        }
      }

      expect(filters.displayPayBlockTotal(data)).to.equal(true)
    })

    it('should return false if primary statutory pay is absent', () => {
      const data = {
        ...baseData,
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'salary-amount': '30000',
          'salary-period': 'year'
        },
        secondary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'salary-amount': '25000',
          'salary-period': 'year'
        }
      }

      expect(filters.displayPayBlockTotal(data)).to.equal(false)
    })
  })

  describe('shouldDisplayPrimaryLeaveAndPayForm', () => {
    const updatedBaseData = {
      ...baseData,
      primary: {
        ...baseData.primary,
        leave: ['0', '1', '2', '3', '4'],
        pay: ['0', '1', '2', '3', '4']
      },
      secondary: {
        ...baseData.secondary,
        leave: ['0', '1', '2', '3', '4'],
        pay: ['0', '1', '2', '3', '4']
      }
    }

    describe('when using visual planner', () => {
      it('should return false if primary parent has taken SPL', () => {
        expect(
          filters.shouldDisplayPrimaryLeaveAndPayForm(updatedBaseData)
        ).to.equal(false)
      })
    })
    describe('when not using visual planner', () => {
      it('should return false if primary parent has not taken SPL and is not using the visual planner', () => {
        const data = {
          ...updatedBaseData,
          visualPlanner: false
        }

        expect(filters.shouldDisplayPrimaryLeaveAndPayForm(data)).to.equal(
          false
        )
      })
    })
  })

  describe('formTemplate', () => {
    it('should replace placeholders with corresponding option values', () => {
      const options = {
        leaveBlocks: [],
        partnerLeaveBlocks: [],
        sharedPayBlocks: [],
        partnerSharedPayBlocks: [],
        parent: 'adopter’s partner',
        otherParent: 'adopter',
        parentOrPartner: 'mother',
        type: 'secondary',
        state: 'adoption',
        leaveAbbreviation: 'AL',
        payAbbreviation: 'SAP',
        sectionCount: 4,
        youIntendLabel: 'you (the adopter’s partner) intend',
        partnerIntendsLabel: 'the adopter intends',
        her: 'their',
        event: 'placement with the family',
        father: "adopter's partner"
      }

      const templateString =
        'The ' +
        options.parent +
        ' and ' +
        options.otherParent +
        ' are both attending the ' +
        options.event +
        '.'

      const template = filters.formTemplate(templateString, options)

      expect(template).to.equal(
        'The adopter’s partner and adopter are both attending the placement with the family.'
      )
    })
  })

  describe('countWeeks', () => {
    it('should correctly count total weeks in blocks', () => {
      const blocks = [
        { start: 1, end: 3 },
        { start: 4, end: 6 }
      ]
      expect(filters.countWeeks(blocks)).to.equal(6)
    })
  })

  describe('htmlAttributesFromObject', () => {
    it('should return HTML attributes string from an object', () => {
      const attributes = { class: 'btn', id: 'submit' }
      expect(filters.htmlAttributesFromObject(attributes)).to.equal(
        'class="btn" id="submit"'
      )
    })

    it('should return undefined if object is not provided', () => {
      expect(filters.htmlAttributesFromObject()).to.equal(undefined)
    })
  })

  describe('blockLength', () => {
    it('should return the correct length for a valid block', () => {
      const block = { start: 2, end: 5 }
      const result = filters.blockLength(block)
      expect(result).to.equal(4)
    })

    it('should return 0 for a block with start greater than end', () => {
      const block = { start: 5, end: 2 }
      const result = filters.blockLength(block)
      expect(result).to.equal(0)
    })

    it('should return 0 for a block with invalid start or end', () => {
      const block1 = { start: 'invalid', end: 5 }
      const block2 = { start: 2, end: 'invalid' }
      const block3 = { start: NaN, end: 5 }
      const block4 = { start: 2, end: NaN }

      expect(filters.blockLength(block1)).to.equal(0)
      expect(filters.blockLength(block2)).to.equal(0)
      expect(filters.blockLength(block3)).to.equal(0)
      expect(filters.blockLength(block4)).to.equal(0)
    })

    it('should return 0 for null or undefined block', () => {
      const result1 = filters.blockLength(null)
      const result2 = filters.blockLength(undefined)

      expect(result1).to.equal(0)
      expect(result2).to.equal(0)
    })

    it('should return 0 for a block without start and end', () => {
      const block = {}
      const result = filters.blockLength(block)
      expect(result).to.equal(0)
    })
  })

  describe('paternalBlockLength', () => {
    it('should return 0 for a null or undefined block', () => {
      expect(filters.paternalBlockLength(null)).to.equal(0)
      expect(filters.paternalBlockLength(undefined)).to.equal(0)
    })

    it('should return 0 for an empty block', () => {
      const block = []
      const result = filters.paternalBlockLength(block)
      expect(result).to.equal(0)
    })

    it('should return 2 for a block with exactly two elements', () => {
      const block = [
        { start: 1, end: 2 },
        { start: 3, end: 4 }
      ]
      const result = filters.paternalBlockLength(block)
      expect(result).to.equal(2)
    })

    it('should return the correct length for a block with one element', () => {
      const block = [{ start: 5, end: 10 }]
      const result = filters.paternalBlockLength(block)
      expect(result).to.equal(6)
    })
  })

  describe('remainingLeaveAllowance', () => {
    it('should return the correct remaining leave allowance for valid leave blocks', () => {
      const result = filters.remainingLeaveAllowance(filledLeaveBlocksData)
      expect(result).to.equal(50)
    })

    it('should return 52 when there are no leave blocks', () => {
      const noLeaveBlocksData = {
        ...filledLeaveBlocksData,
        primary: {},
        secondary: {}
      }

      const result = filters.remainingLeaveAllowance(noLeaveBlocksData)
      expect(result).to.equal(52)
    })
  })

  describe('remainingPayAllowance', () => {
    it('should return the correct remaining leave allowance for valid leave blocks', () => {
      const result = filters.remainingPayAllowance(filledLeaveBlocksData)
      expect(result).to.equal(37)
    })

    it('should return 52 when there are no leave blocks', () => {
      const noLeaveBlocksData = {
        ...filledLeaveBlocksData,
        primary: {},
        secondary: {}
      }

      const result = filters.remainingPayAllowance(noLeaveBlocksData)
      expect(result).to.equal(39)
    })
  })

  describe('hasTakenSpl', () => {
    it('should return true if SPL leave blocks are present', () => {
      const data = {
        primary: {
          initial: { start: '0', leave: 'maternity', end: '1' },
          spl: { _0: { leave: 'shared', start: '3', end: '4' } }
        },
        secondary: {
          'is-taking-paternity-leave': 'yes',
          initial: { start: '0', leave: 'paternity', end: '1' },
          spl: {
            _0: { leave: 'shared', start: '3', end: '4' },
            _1: { leave: 'shared', start: '6', end: '7' }
          }
        },
        'spl-block-planning-order': ['primary', 'secondary', 'done']
      }

      const primary = filters.hasTakenSpl(data, 'primary')
      const secondary = filters.hasTakenSpl(data, 'secondary')

      expect(primary).to.equal(true)
      expect(secondary).to.equal(true)
    })
  })

  describe('weeks', () => {
    it('should correctly format a number into weeks string', () => {
      expect(filters.weeks(1)).to.equal('1 week')
      expect(filters.weeks(5)).to.equal('5 weeks')
    })
  })

  describe('mapValuesToSelectOptions', () => {
    it('should map values to select options correctly', () => {
      const values = [1, 2, 3]
      const textMacro = (value) => `Option ${value}`
      const selected = undefined

      const result = filters.mapValuesToSelectOptions(values, textMacro, selected)
      expect(result).to.deep.equal([
        { value: 1, text: 'Option 1', selected: true },
        { value: 2, text: 'Option 2', selected: false },
        { value: 3, text: 'Option 3', selected: false }
      ])
    })

    it('should select the correct option when a selected value is provided', () => {
      const values = [1, 2, 3]
      const textMacro = (value) => `Option ${value}`
      const selected = 2

      const result = filters.mapValuesToSelectOptions(values, textMacro, selected)
      expect(result).to.deep.equal([
        { value: 1, text: 'Option 1', selected: false },
        { value: 2, text: 'Option 2', selected: true },
        { value: 3, text: 'Option 3', selected: false }
      ])
    })

    it('should handle an empty array of values', () => {
      const values = []
      const textMacro = (value) => `Option ${value}`
      const selected = undefined

      const result = filters.mapValuesToSelectOptions(values, textMacro, selected)
      expect(result).to.deep.equal([])
    })

    it('should call textMacro with the correct parameters', () => {
      const values = [1, 2, 3]
      const textMacro = (value, index) => `Option ${value} at ${index}`
      const selected = undefined

      const result = filters.mapValuesToSelectOptions(values, textMacro, selected)
      expect(result).to.deep.equal([
        { value: 1, text: 'Option 1 at 0', selected: true },
        { value: 2, text: 'Option 2 at 1', selected: false },
        { value: 3, text: 'Option 3 at 2', selected: false }
      ])
    })

    it('should select the first option when selected is undefined', () => {
      const values = [5, 10, 15]
      const textMacro = (value) => `Option ${value}`
      const selected = undefined

      const result = filters.mapValuesToSelectOptions(values, textMacro, selected)
      expect(result).to.deep.equal([
        { value: 5, text: 'Option 5', selected: true },
        { value: 10, text: 'Option 10', selected: false },
        { value: 15, text: 'Option 15', selected: false }
      ])
    })
  })

  describe('errorMessages', () => {
    it('should extract error messages as an array', () => {
      const errors = {
        nameError: { text: 'Name is required' },
        ageError: { text: 'Age is invalid' }
      }
      expect(filters.errorMessages(errors)).to.eql([
        'Name is required',
        'Age is invalid'
      ])
    })
  })
})
