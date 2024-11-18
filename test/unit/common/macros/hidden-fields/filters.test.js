const { describe, it } = require('mocha')
const { expect } = require('chai')
const filters = require('../../../../../common/macros/hidden-fields/filters')()

describe('filters', () => {
  describe('castArray', () => {
    it('returns an array when given a non-array value', () => {
      expect(filters.castArray(1)).to.deep.equal([1])
    })

    it('returns the same array when given an array', () => {
      expect(filters.castArray([1, 2])).to.deep.equal([1, 2])
    })
  })

  describe('isObject', () => {
    it('returns true for objects', () => {
      expect(filters.isObject({ key: 'value' })).to.equal(true)
    })

    it('returns false for non-objects', () => {
      expect(filters.isObject(42)).to.equal(false)
      expect(filters.isObject(null)).to.equal(false)
      expect(filters.isObject(undefined)).to.equal(false)
    })
  })

  describe('fieldNames', () => {
    it('returns the names of the fields in the form inner HTML', () => {
      const formInnerHtml = `
        <input name="name" />
        <input name="name" />
        <input name="email" />
      `
      expect(filters.fieldNames(formInnerHtml)).to.deep.equal([
        'name',
        'email'
      ])
    })
  })

  describe('matchesAnyField', () => {
    it('returns true when the name matches a field', () => {
      const match = filters.matchesAnyField('name', ['name=', 'email='])
      expect(match).to.equal('name=')
    })

    it('returns false when the name does not match any field', () => {
      const match = filters.matchesAnyField('name', ['email='])
      expect(match).to.equal(undefined)
    })
  })
})
