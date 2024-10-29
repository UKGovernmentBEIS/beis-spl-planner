const { describe, it } = require('mocha')
const { expect } = require('chai')
const { typeOfAdoption, initialLeaveAndPay, maternityAllowance, paternityLeaveAndPay } = require('../../../app/skip')

const req = (data) => ({ session: { data } })

describe('dataUtils Functions', () => {
  describe('typeOfAdoption', () => {
    it('should return false if session data indicates adoption', () => {
      const result = typeOfAdoption(req({ 'nature-of-parenthood': 'adoption' }))
      expect(result).to.equal(false)
    })

    it('should return true if session data does not indicate adoption', () => {
      const result = typeOfAdoption(req({ 'nature-of-parenthood': 'birth' }))
      expect(result).to.equal(true)
    })
  })

  describe('initialLeaveAndPay', () => {
    it('should return true if primary user is eligible for both SPL and SHPP', () => {
      const result = initialLeaveAndPay(req({
        primary: { 'spl-eligible': 'yes', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(true)
    })

    it('should return false if primary user is not eligible for SPL or SHPP', () => {
      const result = initialLeaveAndPay(req({
        primary: { 'spl-eligible': 'no', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(false)
    })
  })

  describe('maternityAllowance', () => {
    it('should return true if data indicates adoption', () => {
      const result = maternityAllowance(req({ 'nature-of-parenthood': 'adoption' }))
      expect(result).to.equal(true)
    })

    it('should return true if data indicates surrogacy', () => {
      const result = maternityAllowance(req({ 'nature-of-parenthood': 'surrogacy' }))
      expect(result).to.equal(true)
    })

    it('should return true if primary user is eligible for both SPL and SHPP', () => {
      const result = maternityAllowance(req({
        primary: { 'spl-eligible': 'yes', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(true)
    })

    it('should return true if primary user is eligible for maternity leave and SHPP', () => {
      const result = maternityAllowance(req({
        primary: { 'initial-leave-eligible': 'yes', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(true)
    })

    it('should return true if primary user is eligible for initial pay only', () => {
      const result = maternityAllowance(req({
        primary: { 'initial-pay-eligible': 'yes' }
      }))
      expect(result).to.equal(true)
    })

    it('should return false if none of the conditions are met', () => {
      const result = maternityAllowance(req({
        primary: { 'spl-eligible': 'no', 'shpp-eligible': 'no' }
      }))
      expect(result).to.equal(false)
    })
  })

  describe('paternityLeaveAndPay', () => {
    it('should return true if secondary user is eligible for both SPL and SHPP', () => {
      const result = paternityLeaveAndPay(req({
        secondary: { 'spl-eligible': 'yes', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(true)
    })

    it('should return false if secondary user is not eligible for SPL or SHPP', () => {
      const result = paternityLeaveAndPay(req({
        secondary: { 'spl-eligible': 'no', 'shpp-eligible': 'yes' }
      }))
      expect(result).to.equal(false)
    })
  })
})
