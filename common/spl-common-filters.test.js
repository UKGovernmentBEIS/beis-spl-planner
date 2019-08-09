'use strict'

const { describe, it, beforeEach } = require('mocha')
const { expect } = require('chai')

const Day = require('../common/lib/day')

describe('filters', () => {
  let filters, environment
  beforeEach(() => {
    environment = {
      getFilter: function (name) {
        return args => {}
      }
    }
    filters = require('./spl-common-filters')(environment)
  })

  describe('offsetWeeks', () => {
    it('adds the appropriate number of weeks to the provided date', () => {
      const baseDay = new Day('2019', '10', '01')

      const result = filters.offsetWeeks(baseDay, 2)
      expect(result.format('D MMMM YYYY')).to.equal('15 October 2019')
    })

    it('when provided a negative number, subtracts weeks from the provided week', () => {
      const baseDay = new Day('2018', '07', '23')

      const result = filters.offsetWeeks(baseDay, -3)
      expect(result.format('D MMMM YYYY')).to.equal('2 July 2018')
    })
  })

  describe('formatForDisplay', () => {
    it("returns a string in the form '1 December 2019'", () => {
      const testWeek = new Day('2019', '10', '09')
      expect(filters.formatForDisplay(testWeek)).to.equal('9 October 2019')
    })
  })

  describe('isInPast', () => {
    it('returns true for a date in the past', () => {
      const testDay = new Day().subtract(1, 'days')

      expect(filters.isInPast(testDay)).to.equal(true)
    })

    it('returns false for a the current date', () => {
      const testDay = new Day()

      expect(filters.isInPast(testDay)).to.equal(false)
    })

    it('returns false for a date in the future', () => {
      const testDay = new Day().add(1, 'days')

      expect(filters.isInPast(testDay)).to.equal(false)
    })
  })
})
