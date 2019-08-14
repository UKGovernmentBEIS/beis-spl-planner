const Day = require('./lib/day')
const dataUtils = require('./lib/dataUtils')
const { SERVICE_NAME } = require('../app/constants')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  const capitalize = env.getFilter('capitalize')

  function otherParentName (data, currentParent) {
    return currentParent === 'primary' ? dataUtils.secondaryName(data) : dataUtils.primaryName(data)
  }

  function primaryLeaveType (data) {
    return dataUtils.isBirth(data) ? 'maternity' : 'adoption'
  }

  function parentInitialLeaveType (data, parent) {
    if (parent === 'primary') {
      return primaryLeaveType(data)
    } else {
      return 'paternity'
    }
  }

  function startDateName (data) {
    return dataUtils.isAdoption(data) ? 'match date' : 'due date'
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

  function endOfWeek (day) {
    return day.endOfWeek()
  }

  function isInPast (day) {
    return day.isInPast()
  }

  function removeEmpty (array) {
    return array.filter(element => !!element)
  }

  function pageTitle (...pageSpecificParts) {
    return [...pageSpecificParts, capitalize(SERVICE_NAME), 'GOV.UK'].filter(string => string).join(' - ')
  }

  return {
    ...dataUtils,
    otherParentName,
    primaryLeaveType,
    parentInitialLeaveType,
    startDateName,
    offsetWeeks,
    exampleDate,
    formatDate,
    formatForDisplay,
    endOfWeek,
    isInPast,
    removeEmpty,
    pageTitle,
    ...require('./macros/hidden-fields/filters')(env)
  }
}
