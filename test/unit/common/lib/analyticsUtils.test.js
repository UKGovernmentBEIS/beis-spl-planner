const { describe, it } = require('mocha')
const { expect } = require('chai')
const { JSDOM } = require('jsdom')
const {
  getGaFields,
  getNatureOfParenthood
} = require('../../../../common/lib/analyticsUtils')

describe('analyticsUtils', () => {
  describe('getGaFields', () => {
    it('should return an object with Google Analytics fields from element attributes', () => {
      const { document } = new JSDOM(
        '<div data-ga-field-category="buttons" data-ga-field-action="click"></div>'
      ).window
      const element = document.querySelector('div')

      const result = getGaFields(element)

      expect(result).to.deep.equal({
        category: 'buttons',
        action: 'click'
      })
    })

    it('should return an empty object when no matching attributes are present', () => {
      const { document } = new JSDOM('<div></div>').window
      const element = document.querySelector('div')

      const result = getGaFields(element)

      expect(result).to.deep.equal({})
    })

    it('should handle multiple data-ga-field-* attributes', () => {
      const { document } = new JSDOM(
        '<div data-ga-field-category="buttons" data-ga-field-action="click" data-ga-field-label="submit"></div>'
      ).window
      const element = document.querySelector('div')

      const result = getGaFields(element)

      expect(result).to.deep.equal({
        category: 'buttons',
        action: 'click',
        label: 'submit'
      })
    })
  })

  describe('getNatureOfParenthood', () => {
    it('should return the value of the checked radio button', () => {
      const { window } = new JSDOM(`
        <input type="radio" name="nature-of-parenthood" value="birth">
        <input type="radio" name="nature-of-parenthood" value="adoption" checked>
        <input type="radio" name="nature-of-parenthood" value="surrogacy">
      `)

      const result = getNatureOfParenthood(window.document)

      expect(result).to.equal('adoption')
    })

    it('should return the value of the first radio button if no checked radio button is found', () => {
      const { window } = new JSDOM(`
        <input type="radio" name="nature-of-parenthood" value="birth">
        <input type="radio" name="nature-of-parenthood" value="adoption">
        <input type="radio" name="nature-of-parenthood" value="surrogacy">
      `)

      const result = getNatureOfParenthood(window.document)

      expect(result).to.equal('birth')
    })
  })
})
