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

// Constants for test data
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
  'start-date-day': '1',
  'start-date-month': '1',
  'start-date-year': '2024'
}

const errorWithDayPart = { 'start-date': { dateParts: ['day'] } }
const errorWithMonthPart = { 'start-date': { dateParts: ['month'] } }
const calendarError = { 'calendar.1': 'error' }
const nonCalendarError = { 'other-error': 'error' }

const primarySalaryPresent = { primary: { 'salary-amount': 50000 } }
const noSalary = { primary: {}, secondary: {} }

const totalPayBlock = { primary: '£1000', secondary: '£500' }

describe('filters.js', () => {
  describe('hasStartDateError', () => {
    it('should return true if start-date error exists for a specific date part', () => {
      expect(filters.hasStartDateError(errorWithDayPart, 'day')).to.equal(true)
    })

    it('should return false if there is no start-date error for the specified date part', () => {
      expect(filters.hasStartDateError(errorWithMonthPart, 'day')).to.equal(false)
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
      expect(day).to.be.instanceOf(Day)
      expect(day.year()).to.equal(2024)
      expect(day.monthOneIndexed()).to.equal(1)
      expect(day.date()).to.equal(1)
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

  describe('totalBlockPay', () => {
    it('should return the total pay amount formatted as a string', () => {
      expect(filters.totalBlockPay(totalPayBlock)).to.equal('£1500.00')
    })
  })

  describe('displayPayBlockTotal', () => {
    it('should return true if primary statutory pay is present and salaries are numbers', () => {
      const data = {
        primary: {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '30000',
          'salary-period': 'year'
        },
        secondary: {
          'salary-amount': '25000',
          'salary-period': 'year'
        },
        backPathForHelpPages: '/summary',
        'nature-of-parenthood': 'birth',
        'start-date-day': '1',
        'start-date-month': '1',
        'start-date-year': '2024',
        visualPlanner: true
      }

      expect(filters.displayPayBlockTotal(data)).to.equal(true)
    })

    it('should return false if primary statutory pay is absent', () => {
      const data = {
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
        },
        backPathForHelpPages: '/summary',
        'nature-of-parenthood': 'birth',
        'start-date-day': '1',
        'start-date-month': '1',
        'start-date-year': '2024',
        visualPlanner: true
      }

      expect(filters.displayPayBlockTotal(data)).to.equal(false)
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

  describe('weeks', () => {
    it('should correctly format a number into weeks string', () => {
      expect(filters.weeks(1)).to.equal('1 week')
      expect(filters.weeks(5)).to.equal('5 weeks')
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
