const _ = require('lodash')
const qs = require('qs')
const { JSDOM } = require('jsdom')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function castArray (value) {
    return _.castArray(value)
  }

  function isObject (value) {
    return _.isObject(value)
  }

  function fieldNames (formInnerHtml) {
    const dom = new JSDOM(formInnerHtml)
    const inputs = dom.window.document.getElementsByTagName('input')
    const names = new Set([...inputs].map(input => normalisedFieldName(input.name)))
    return [...names]
  }

  function matchesAnyField (name, fieldsToMatch) {
    const normalisedName = normalisedFieldName(name)
    return fieldsToMatch.find(field => normalisedFieldName(field) === normalisedName)
  }

  function normalisedFieldName (name) {
    const normalisedQueryString = qs.stringify(qs.parse(name), { encode: false })
    return normalisedQueryString.substring(0, normalisedQueryString.length - 1) // Remove trailing "=" sign
  }

  return {
    castArray,
    isObject,
    fieldNames,
    matchesAnyField
  }
}
