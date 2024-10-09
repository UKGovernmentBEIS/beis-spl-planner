const { describe, it } = require('mocha')
const { expect } = require('chai')
const {
  feedbackExperience,
  natureOfParenthood,
  typeOfAdoption,
  isBirth,
  isAdoption,
  earliestPrimaryLeaveWeek,
  isPrimaryIneligible,
  isUkAdoption,
  isOverseasAdoption,
  isSurrogacy,
  parentName,
  parentNameForUrl,
  primaryName,
  secondaryName,
  primaryUrlName,
  isYes,
  isNo,
  splBlockPlanningOrder,
  shouldSetNewFirstSplWeek,
  shouldResetFirstSplWeek,
  isLeaveTypeOther,
  isLeaveTypeShared
} = require('../../../../common/lib/dataUtils')

describe('dataUtils', () => {
  describe('feedbackExperience', () => {
    it('should return true if data is a string and matches optionName', () => {
      const result = feedbackExperience('testOption', 'testOption')
      expect(result).to.equal(true)
    })

    it('should return false if data is a string and does not match optionName', () => {
      const result = feedbackExperience('testOption', 'otherOption')
      expect(result).to.equal(false)
    })

    it('should return true if data has feedback property that matches optionName', () => {
      const result = feedbackExperience({ feedback: 'testOption' }, 'testOption')
      expect(result).to.equal(true)
    })

    it('should return false if data has feedback property that does not match optionName', () => {
      const result = feedbackExperience({ feedback: 'otherOption' }, 'testOption')
      expect(result).to.equal(false)
    })
  })

  describe('natureOfParenthood', () => {
    it('should return the nature-of-parenthood value from data', () => {
      const data = { 'nature-of-parenthood': 'birth' }
      const result = natureOfParenthood(data)
      expect(result).to.equal('birth')
    })
  })

  describe('typeOfAdoption', () => {
    it('should return the type-of-adoption value from data', () => {
      const data = { 'type-of-adoption': 'uk' }
      const result = typeOfAdoption(data)
      expect(result).to.equal('uk')
    })
  })

  describe('isBirth', () => {
    it('should return true if data is a string "birth"', () => {
      const result = isBirth('birth')
      expect(result).to.equal(true)
    })

    it('should return false if data is a string "adoption"', () => {
      const result = isBirth('adoption')
      expect(result).to.equal(false)
    })

    it('should return true if nature-of-parenthood in data is "birth"', () => {
      const result = isBirth({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal(true)
    })

    it('should return false if nature-of-parenthood in data is not "birth"', () => {
      const result = isBirth({ 'nature-of-parenthood': 'adoption' })
      expect(result).to.equal(false)
    })
  })

  describe('isAdoption', () => {
    it('should return true if data is a string "adoption"', () => {
      const result = isAdoption('adoption')
      expect(result).to.equal(true)
    })

    it('should return false if data is a string "birth"', () => {
      const result = isAdoption('birth')
      expect(result).to.equal(false)
    })

    it('should return true if nature-of-parenthood in data is "adoption"', () => {
      const result = isAdoption({ 'nature-of-parenthood': 'adoption' })
      expect(result).to.equal(true)
    })

    it('should return false if nature-of-parenthood in data is not "adoption"', () => {
      const result = isAdoption({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal(false)
    })
  })

  describe('earliestPrimaryLeaveWeek', () => {
    it('should return -11 for birth data', () => {
      const result = earliestPrimaryLeaveWeek({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal(-11)
    })

    it('should return -2 for UK adoption data', () => {
      const result = earliestPrimaryLeaveWeek({ 'nature-of-parenthood': 'adoption', 'type-of-adoption': 'uk' })
      expect(result).to.equal(-2)
    })

    it('should return 0 for other types of data', () => {
      const result = earliestPrimaryLeaveWeek({ 'nature-of-parenthood': 'other' })
      expect(result).to.equal(0)
    })
  })

  describe('isPrimaryIneligible', () => {
    it('should return true if all eligibility flags are "no" for birth data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no',
          'maternity-allowance-eligible': 'no'
        },
        'nature-of-parenthood': 'birth'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(true)
    })

    it('should return false if any eligibility flag is "yes" for birth data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no',
          'maternity-allowance-eligible': 'no'
        },
        'nature-of-parenthood': 'birth'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(false)
    })

    it('should return true if all eligibility flags are "no" for adoption data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no'
        },
        'nature-of-parenthood': 'adoption'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(true)
    })

    it('should return false if any eligibility flag is "yes" for adoption data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no'
        },
        'nature-of-parenthood': 'adoption'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(false)
    })
  })

  describe('isUkAdoption', () => {
    it('should return true for UK adoption data', () => {
      const data = {
        'nature-of-parenthood': 'adoption',
        'type-of-adoption': 'uk'
      }
      const result = isUkAdoption(data)
      expect(result).to.equal(true)
    })

    it('should return false for non-UK adoption data', () => {
      const data = {
        'nature-of-parenthood': 'adoption',
        'type-of-adoption': 'overseas'
      }
      const result = isUkAdoption(data)
      expect(result).to.equal(false)
    })

    it('should return false for birth data', () => {
      const data = {
        'nature-of-parenthood': 'birth'
      }
      const result = isUkAdoption(data)
      expect(result).to.equal(false)
    })
  })

  describe('isOverseasAdoption', () => {
    it('should return true for overseas adoption data', () => {
      const data = {
        'nature-of-parenthood': 'adoption',
        'type-of-adoption': 'overseas'
      }
      const result = isOverseasAdoption(data)
      expect(result).to.equal(true)
    })

    it('should return false for non-overseas adoption data', () => {
      const data = {
        'nature-of-parenthood': 'adoption',
        'type-of-adoption': 'uk'
      }
      const result = isOverseasAdoption(data)
      expect(result).to.equal(false)
    })

    it('should return false for birth data', () => {
      const data = {
        'nature-of-parenthood': 'birth'
      }
      const result = isOverseasAdoption(data)
      expect(result).to.equal(false)
    })
  })

  describe('isSurrogacy', () => {
    it('should return true if data is a string "surrogacy"', () => {
      const result = isSurrogacy('surrogacy')
      expect(result).to.equal(true)
    })

    it('should return false if data is a string "adoption"', () => {
      const result = isSurrogacy('adoption')
      expect(result).to.equal(false)
    })

    it('should return true if nature-of-parenthood in data is "surrogacy"', () => {
      const result = isSurrogacy({ 'nature-of-parenthood': 'surrogacy' })
      expect(result).to.equal(true)
    })

    it('should return false if nature-of-parenthood in data is not "surrogacy"', () => {
      const result = isSurrogacy({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal(false)
    })
  })

  describe('parentName', () => {
    it('should return "mother" for primary parent with birth data', () => {
      const result = parentName({ 'nature-of-parenthood': 'birth' }, 'primary')
      expect(result).to.equal('mother')
    })

    it('should return "primary adopter" for primary parent with adoption data', () => {
      const result = parentName({ 'nature-of-parenthood': 'adoption' }, 'primary')
      expect(result).to.equal('primary adopter')
    })

    it('should return "parental order parent" for non-birth or non-adoption data', () => {
      const result = parentName({ 'nature-of-parenthood': 'other' }, 'primary')
      expect(result).to.equal('parental order parent')
    })

    it('should return "partner" for secondary parent', () => {
      const result = parentName({}, 'secondary')
      expect(result).to.equal('partner')
    })
  })

  describe('parentNameForUrl', () => {
    it('should return "mother" for primary parent with birth data', () => {
      const result = parentNameForUrl({ 'nature-of-parenthood': 'birth' }, 'primary')
      expect(result).to.equal('mother')
    })

    it('should return "primary-adopter" for primary parent with adoption data', () => {
      const result = parentNameForUrl({ 'nature-of-parenthood': 'adoption' }, 'primary')
      expect(result).to.equal('primary-adopter')
    })

    it('should return "parental-order-parent" for non-birth or non-adoption data', () => {
      const result = parentNameForUrl({ 'nature-of-parenthood': 'other' }, 'primary')
      expect(result).to.equal('parental-order-parent')
    })

    it('should return "partner" for secondary parent', () => {
      const result = parentNameForUrl({}, 'secondary')
      expect(result).to.equal('partner')
    })
  })

  describe('primaryName', () => {
    it('should return "mother" for birth data', () => {
      const result = primaryName({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal('mother')
    })

    it('should return "primary adopter" for adoption data', () => {
      const result = primaryName({ 'nature-of-parenthood': 'adoption' })
      expect(result).to.equal('primary adopter')
    })

    it('should return "parental order parent" for other types of data', () => {
      const result = primaryName({ 'nature-of-parenthood': 'other' })
      expect(result).to.equal('parental order parent')
    })
  })

  describe('secondaryName', () => {
    it('should always return "partner"', () => {
      const result = secondaryName()
      expect(result).to.equal('partner')
    })
  })

  describe('primaryUrlName', () => {
    it('should return "mother" for birth data', () => {
      const result = primaryUrlName({ 'nature-of-parenthood': 'birth' })
      expect(result).to.equal('mother')
    })

    it('should return "primary-adopter" for adoption data', () => {
      const result = primaryUrlName({ 'nature-of-parenthood': 'adoption' })
      expect(result).to.equal('primary-adopter')
    })

    it('should return "parental-order-parent" for other types of data', () => {
      const result = primaryUrlName({ 'nature-of-parenthood': 'other' })
      expect(result).to.equal('parental-order-parent')
    })
  })

  describe('isYes', () => {
    it('should return true for "yes"', () => {
      const result = isYes('yes')
      expect(result).to.equal(true)
    })

    it('should return false for "no"', () => {
      const result = isYes('no')
      expect(result).to.equal(false)
    })

    it('should return false for other strings', () => {
      const result = isYes('maybe')
      expect(result).to.equal(false)
    })
  })

  describe('isNo', () => {
    it('should return true for "no"', () => {
      const result = isNo('no')
      expect(result).to.equal(true)
    })

    it('should return false for "yes"', () => {
      const result = isNo('yes')
      expect(result).to.equal(false)
    })

    it('should return false for other strings', () => {
      const result = isNo('maybe')
      expect(result).to.equal(false)
    })
  })

  describe('splBlockPlanningOrder', () => {
    it('should return the spl-block-planning-order array from data', () => {
      const data = { 'leave-blocks': { 'spl-block-planning-order': ['block1', 'block2'] } }
      const result = splBlockPlanningOrder(data)
      expect(result).to.deep.equal(['block1', 'block2'])
    })

    it('should return an empty array if spl-block-planning-order is not present in data', () => {
      const data = { 'leave-blocks': {} }
      const result = splBlockPlanningOrder(data)
      expect(result).to.deep.equal([])
    })

    it('should return an empty array if leave-blocks is not present in data', () => {
      const data = {}
      const result = splBlockPlanningOrder(data)
      expect(result).to.deep.equal([])
    })
  })

  describe('isPrimaryIneligible', () => {
    it('should return true if all eligibility flags are "no" for birth data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no',
          'maternity-allowance-eligible': 'no'
        },
        'nature-of-parenthood': 'birth'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(true)
    })

    it('should return false if any eligibility flag is "yes" for birth data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no',
          'maternity-allowance-eligible': 'no'
        },
        'nature-of-parenthood': 'birth'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(false)
    })

    it('should return true if all eligibility flags are "no" for adoption data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'no',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no'
        },
        'nature-of-parenthood': 'adoption'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(true)
    })

    it('should return false if any eligibility flag is "yes" for adoption data', () => {
      const data = {
        primary: {
          'spl-eligible': 'no',
          'shpp-eligible': 'yes',
          'initial-leave-eligible': 'no',
          'initial-pay-eligible': 'no'
        },
        'nature-of-parenthood': 'adoption'
      }
      const result = isPrimaryIneligible(data)
      expect(result).to.equal(false)
    })
  })

  describe('isLeaveTypeShared', () => {
    it('should return true if leave type is "shared"', () => {
      const data = 'shared'
      const result = isLeaveTypeShared(data)
      expect(result).to.equal(true)
    })

    it('should return false if leave type is not "shared"', () => {
      const data = 'maternity'
      const result = isLeaveTypeShared(data)
      expect(result).to.equal(false)
    })

    it('should return false if leave type is undefined', () => {
      const data = ''
      const result = isLeaveTypeShared(data)
      expect(result).to.equal(false)
    })
  })

  describe('isLeaveTypeOther', () => {
    it('should return true if leave type is "other"', () => {
      const data = 'adoption'
      const result = isLeaveTypeOther(data)
      expect(result).to.equal(true)
    })

    it('should return false if leave type is not "other"', () => {
      const data = 'shared'
      const result = isLeaveTypeOther(data)
      expect(result).to.equal(false)
    })

    it('should return false if leave type is undefined', () => {
      const data = ''
      const result = isLeaveTypeOther(data)
      expect(result).to.equal(false)
    })
  })

  describe('shouldSetNewFirstSplWeek', () => {
    it('should return true if checked is true, parent is "primary", leaveType is "other", and newWeek < previousWeek and newWeek > 0', () => {
      const checked = true
      const parent = 'primary'
      const leaveType = 'maternity'
      const newWeek = 5
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(true)
    })

    it('should return false if checked is false, even if other conditions are true', () => {
      const checked = false
      const parent = 'primary'
      const leaveType = 'other'
      const newWeek = 5
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if parent is not "primary"', () => {
      const checked = true
      const parent = 'secondary'
      const leaveType = 'other'
      const newWeek = 5
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if leaveType is not "other"', () => {
      const checked = true
      const parent = 'primary'
      const leaveType = 'shared'
      const newWeek = 5
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if newWeek is not less than previousWeek', () => {
      const checked = true
      const parent = 'primary'
      const leaveType = 'other'
      const newWeek = 15
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if newWeek is not greater than 0', () => {
      const checked = true
      const parent = 'primary'
      const leaveType = 'other'
      const newWeek = -1
      const previousWeek = 10

      const result = shouldSetNewFirstSplWeek(checked, parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })
  })

  describe('shouldResetFirstSplWeek', () => {
    it('should return true if parent is "primary", leaveType is "shared", and newWeek equals previousWeek', () => {
      const parent = 'primary'
      const leaveType = 'shared'
      const newWeek = 5
      const previousWeek = 5

      const result = shouldResetFirstSplWeek(parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(true)
    })

    it('should return false if parent is not "primary"', () => {
      const parent = 'secondary'
      const leaveType = 'shared'
      const newWeek = 5
      const previousWeek = 5

      const result = shouldResetFirstSplWeek(parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if leaveType is not "shared"', () => {
      const parent = 'primary'
      const leaveType = 'maternity'
      const newWeek = 5
      const previousWeek = 5

      const result = shouldResetFirstSplWeek(parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })

    it('should return false if newWeek does not equal previousWeek', () => {
      const parent = 'primary'
      const leaveType = 'shared'
      const newWeek = 5
      const previousWeek = 6

      const result = shouldResetFirstSplWeek(parent, leaveType, newWeek, previousWeek)
      expect(result).to.equal(false)
    })
  })
})
