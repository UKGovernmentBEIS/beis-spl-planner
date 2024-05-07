const { describe, it } = require('mocha')
const assert = require('chai').assert
const moment = require('moment')
// const LeaveTracker = require('../../../app/lib/leaveTracker')
const { earliestPrimaryLeaveWeek } = require('../../../common/lib/dataUtils')
// const _ = require('lodash')

const Weeks = require('../../../app/lib/weeks')

const options = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 10, leaveWeeks: [1, 2, 3], payWeeks: [1, 2] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: true,
      statutoryLeave: false
    }
  }
}

const options2 = {
  natureOfParenthood: 'surrogacy',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 10, leaveWeeks: [1, 2, 3], payWeeks: [1, 2] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: false,
      statutoryLeave: false
    }
  }
}

const options3 = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 0, leaveWeeks: [1, 2, 3, 12], payWeeks: [1, 2, 11, 12] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: true,
      statutoryLeave: false
    }
  }
}

const options4 = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 0, leaveWeeks: [0, 1], payWeeks: [0, 1] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: false,
      statutoryLeave: false
    }
  }
}

describe('Weeks Class', function () {
  describe('Constructor', function () {
    it('should properly initialise with the provided options', function () {
      const weeks = new Weeks(options)

      assert.equal(weeks.primaryLeaveType, 'maternity')

      // Verify that properties are set correctly
      assert.deepEqual(weeks.startWeek, options.startWeek) // <- 'deepEqual' tests structural equality; does not test whether the operands are the same object, but rather that they're equivalent.
      assert.deepEqual(weeks.primary, options.primary)
      assert.deepEqual(weeks.secondary, options.secondary)
      assert.deepEqual(weeks.primaryLeaveType, 'maternity') // <- Based on natureOfParenthood === 'birth'
      assert.deepEqual(weeks.eligibility, options.eligibility)

      // Check computed properties
      assert.equal(weeks.minimumWeek, earliestPrimaryLeaveWeek({ 'nature-of-parenthood': 'birth', 'type-of-adoption': undefined }))
      assert.isObject(weeks.payRates)
    })
  })

  describe('leaveAndPay method', function () {
    it('should generate 52 weeks of leave data', function () {
      const weeks = new Weeks(options2)
      const result = weeks.leaveAndPay()

      assert.isArray(result.weeks)
      assert.equal(result.weeks.length - 1, 52)
    })

    it('should handle primary SPL start correctly', function () {
      const weeks = new Weeks(options3)
      const result = weeks.leaveAndPay()
      const week13 = result.weeks[12]

      assert.equal(week13.primary.leave.text, 'shared')
      assert.equal(week13.primary.pay.text, 'Up to £184.03')
    })
  })

  describe('Eligibility check methods', function () {
    const weeks = new Weeks(options4)

    it('should return true for eligible primary leave week', function () {
      const result = weeks._weekEligibleForPrimaryLeave({ primary: { leave: { text: 'maternity' } } })

      assert.isTrue(result)
    })

    it('should return false for ineligible secondary leave week', function () {
      const result = weeks._weekEligibleForSecondaryLeave({ secondary: { leave: { text: 'paternity' } } })

      assert.isFalse(result)
    })
  })
})
