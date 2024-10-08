const { describe, it } = require('mocha')
const assert = require('chai').assert
// const LeaveTracker = require('../../../app/lib/leaveTracker')
const { earliestPrimaryLeaveWeek } = require('../../../../common/lib/dataUtils')
// const _ = require('lodash')

const Weeks = require('../../../../app/lib/weeks')

// Test data
const birthWithSpl = require('../../../data/weeksTestOptions/birthWithSpl')
const surrogacyWithSpl = require('../../../data/weeksTestOptions/surrogacyWithSpl')
const birthSplStartsCorrectly = require('../../../data/weeksTestOptions/birthSplStartsCorrectly')
const birthPrimaryLeaveStatutoryPay = require('../../../data/weeksTestOptions/birthPrimaryLeaveStatutoryPay')
const birthMaternityAllowanceOnly = require('../../../data/weeksTestOptions/birthMaternityAllowanceOnly')
const birthShppOnly = require('../../../data/weeksTestOptions/birthShppOnly')

describe('Weeks Class', function () {
  describe('Constructor', function () {
    it('should properly initialise with the provided options', function () {
      const weeks = new Weeks(birthWithSpl)

      assert.equal(weeks.primaryLeaveType, 'maternity')

      // Verify that properties are set correctly
      assert.deepEqual(weeks.startWeek, birthWithSpl.startWeek) // <- 'deepEqual' tests structural equality; does not test whether the operands are the same object, but rather that they're equivalent.
      assert.deepEqual(weeks.primary, birthWithSpl.primary)
      assert.deepEqual(weeks.secondary, birthWithSpl.secondary)
      assert.deepEqual(weeks.primaryLeaveType, 'maternity') // <- Based on natureOfParenthood === 'birth'
      assert.deepEqual(weeks.eligibility, birthWithSpl.eligibility)

      // Check computed properties
      assert.equal(weeks.minimumWeek, earliestPrimaryLeaveWeek({ 'nature-of-parenthood': 'birth', 'type-of-adoption': undefined }))
      assert.isObject(weeks.payRates)
    })
  })

  describe('leaveAndPay method', function () {
    it('should generate 52 weeks of leave data', function () {
      const weeks = new Weeks(surrogacyWithSpl)
      const result = weeks.leaveAndPay()

      assert.isArray(result.weeks)
      assert.equal(result.weeks.length - 1, 52)
    })

    it('should handle primary SPL start correctly', function () {
      const weeks = new Weeks(birthSplStartsCorrectly)
      const result = weeks.leaveAndPay()
      const week13 = result.weeks[12]

      assert.equal(week13.primary.leave.text, 'shared')
      assert.equal(week13.primary.pay.text, 'Up to £184.03')
    })
  })

  describe('Eligibility check methods', function () {
    const weeks = new Weeks(birthPrimaryLeaveStatutoryPay)
    const weeks2 = new Weeks(birthMaternityAllowanceOnly)
    const weeks3 = new Weeks(birthShppOnly)

    it('should return true for eligible primary leave week', function () {
      const result = weeks._weekEligibleForPrimaryLeave({ primary: { leave: { text: 'maternity' } } })

      assert.isTrue(result)
    })

    it('should return true for eligible statutory leave week', function () {
      const result = weeks2._weekEligibleForPrimaryLeave({ primary: { leave: { text: 'maternity' } } })

      assert.isTrue(result)
    })

    it('should return false for ineligible statutory leave week', function () {
      const result = weeks3._weekEligibleForPrimaryLeave({ primary: { leave: { text: 'maternity' } } })

      assert.isFalse(result)
    })

    it('should return false for ineligible secondary leave week', function () {
      const result = weeks._weekEligibleForSecondaryLeave({ secondary: { leave: { text: 'paternity' } } })

      assert.isFalse(result)
    })

    it('should return false for ineligible secondary statutory leave week', function () {
      const result = weeks2._weekEligibleForSecondaryLeave({ secondary: { leave: { text: 'paternity' } } })

      assert.isFalse(result)
    })

    it('should return true for eligible primary pay week', function () {
      const result = weeks2._weekEligibleForPrimaryPay({ primary: { leave: { text: 'maternity' } } })

      assert.isTrue(result)
    })
  })

  describe('Shared Pay or Leave methods', function () {
    const weeks = new Weeks(birthWithSpl)

    it('should return false for primary shared pay', function () {
      const result = weeks.hasPrimarySharedPayOrLeave()

      assert.isFalse(result)
    })
  })
})
