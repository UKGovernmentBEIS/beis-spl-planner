const Day = require('./lib/day')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function primaryName (data) {
    return data['birth-or-adoption'] === 'birth' ? 'mother' : 'primary adopter'
  }

  function secondaryName (data) {
    return 'partner'
  }

  function parentName (data, currentParent) {
    return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
  }

  function otherParentName (data, currentParent) {
    return currentParent === 'primary' ? secondaryName(data) : primaryName(data)
  }

  function parentNameForUrl (data, parent) {
    return parentName(data, parent).split(' ').join('-')
  }

  function isBirth (data) {
    return data['birth-or-adoption'] === 'birth'
  }

  function primaryLeaveType (data) {
    return isBirth(data) ? 'maternity' : 'adoption'
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
    return new Day().add(30, 'days').format('D M YYYY')
  }

  function formatDate (day, format) {
    return day.format(format)
  }

  function formatForDisplay (day) {
    return day.format('D MMMM YYYY')
  }

  function isInPast (day) {
    return day.isInPast()
  }

  function removeEmpty (array) {
    return array.filter(element => !!element)
  }

  return {
    primaryName,
    secondaryName,
    parentName,
    currentParentName: parentName, // Alias.
    otherParentName,
    parentNameForUrl,
    isBirth,
    primaryLeaveType,
    isAdoption,
    capitalize,
    startDateName,
    offsetWeeks,
    exampleDate,
    formatDate,
    formatForDisplay,
    isInPast,
    removeEmpty,
    ...require('./macros/hidden-fields/filters')(env)
  }
}
