const Day = require('./lib/day')
const dataUtils = require('./lib/dataUtils')
const { SERVICE_NAME } = require('../app/constants')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function isYes (dataField) {
    return dataUtils.isYes(dataField)
  }

  function isNo (dataField) {
    return dataUtils.isNo(dataField)
  }

  function isBirth (data) {
    return dataUtils.isBirth(data)
  }

  function isAdoption (data) {
    return dataUtils.isAdoption(data)
  }

  function earliestPrimaryLeaveWeek (data) {
    return dataUtils.earliestPrimaryLeaveWeek(data)
  }

  function isSurrogacy (data) {
    return dataUtils.isSurrogacy(data)
  }

  function primaryName (data) {
    return dataUtils.primaryName(data)
  }

  function secondaryName (data) {
    return dataUtils.secondaryName(data)
  }

  function parentName (data, currentParent) {
    return dataUtils.parentName(data, currentParent)
  }

  function otherParentName (data, currentParent) {
    return currentParent === 'primary' ? secondaryName(data) : primaryName(data)
  }

  function parentNameForUrl (data, parent) {
    return parentName(data, parent).split(' ').join('-')
  }

  function primaryLeaveType (data) {
    return isBirth(data) ? 'maternity' : 'adoption'
  }

  function parentInitialLeaveType (data, parent) {
    if (parent === 'primary') {
      return primaryLeaveType(data)
    } else {
      return 'paternity'
    }
  }

  function capitalise (string) {
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

  function pageTitle (...pageSpecificParts) {
    return [...pageSpecificParts, capitalise(SERVICE_NAME), 'GOV.UK'].filter(string => string).join(' - ')
  }

  return {
    isYes,
    isNo,
    isBirth,
    isAdoption,
    earliestPrimaryLeaveWeek,
    isSurrogacy,
    primaryName,
    secondaryName,
    parentName,
    currentParentName: parentName, // Alias.
    otherParentName,
    parentNameForUrl,
    primaryLeaveType,
    parentInitialLeaveType,
    capitalise,
    startDateName,
    offsetWeeks,
    exampleDate,
    formatDate,
    formatForDisplay,
    isInPast,
    removeEmpty,
    pageTitle,
    ...require('./macros/hidden-fields/filters')(env)
  }
}
