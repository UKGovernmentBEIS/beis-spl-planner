const { describe, it } = require('mocha')
const { expect } = require('chai')
const { getWeekByNumber } = require('../../../../app/lib/weekUtils')

describe('weekUtils', () => {
  describe('getWeekByNumber', () => {
    it('returns the correct week when the number exists', () => {
      const weeks = [
        { number: 1, name: 'Week 1' },
        { number: 2, name: 'Week 2' },
        { number: 3, name: 'Week 3' }
      ]
      const result = getWeekByNumber(weeks, 2)
      expect(result).to.deep.equal({ number: 2, name: 'Week 2' })
    })

    it('returns undefined when the number does not exist', () => {
      const weeks = [
        { number: 1, name: 'Week 1' },
        { number: 2, name: 'Week 2' }
      ]
      const result = getWeekByNumber(weeks, 3)
      expect(result).to.equal(undefined)
    })

    it('returns undefined for an empty array', () => {
      const weeks = []
      const result = getWeekByNumber(weeks, 1)
      expect(result).to.equal(undefined)
    })

    it('handles a number that is not an integer', () => {
      const weeks = [
        { number: 1, name: 'Week 1' },
        { number: 2, name: 'Week 2' }
      ]
      const result = getWeekByNumber(weeks, 1.5)
      expect(result).to.equal(undefined)
    })

    it('handles an array with duplicate week numbers', () => {
      const weeks = [
        { number: 1, name: 'Week 1' },
        { number: 1, name: 'Duplicate Week 1' }
      ]
      const result = getWeekByNumber(weeks, 1)
      expect(result).to.deep.equal({ number: 1, name: 'Week 1' }) // Verifies it returns the first match
    })

    it('does not mutate the original array', () => {
      const weeks = [
        { number: 1, name: 'Week 1' },
        { number: 2, name: 'Week 2' }
      ]
      const originalWeeks = [...weeks]
      getWeekByNumber(weeks, 1)
      expect(weeks).to.deep.equal(originalWeeks)
    })
  })
})
