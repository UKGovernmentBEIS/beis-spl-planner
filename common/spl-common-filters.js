const Day = require('./lib/day')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function primaryName (data) {
    return data['birth-or-adoption'] === 'birth' ? 'mother' : 'primary adopter'
  }

  function primaryNameForUrl (data) {
    return primaryName(data).split(' ').join('-')
  }

  function secondaryName (data) {
    return 'partner'
  }

  function secondaryNameForUrl (data) {
    return secondaryName(data).split(' ').join('-')
  }

  function currentParentName (data, currentParent) {
    return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
  }

  function otherParentName (data, currentParent) {
    return currentParent === 'primary' ? secondaryName(data) : primaryName(data)
  }

  function isBirth (data) {
    return data['birth-or-adoption'] === 'birth'
  }

  function isAdoption (data) {
    return data['birth-or-adoption'] === 'adoption'
  }

  function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  function startDateName (data) {
    return isBirth(data) ? 'due date' : 'match date'
  }

  function offsetWeeks (baseDay, numberOfWeeks) {
    return baseDay.add(numberOfWeeks, 'weeks')
  }

  function exampleDate () {
    return new Day().add(30, 'days').formatForExample()
  }

  function formatForDisplay (day) {
    return day.formatForDisplay()
  }

  function isInPast (day) {
    return day.isInPast()
  }

  return {
    primaryName,
    primaryNameForUrl,
    secondaryName,
    secondaryNameForUrl,
    currentParentName,
    otherParentName,
    isBirth,
    isAdoption,
    capitalize,
    startDateName,
    offsetWeeks,
    exampleDate,
    formatForDisplay,
    isInPast,
    ...require('./macros/hidden-fields/filters')(env)
  }
}
