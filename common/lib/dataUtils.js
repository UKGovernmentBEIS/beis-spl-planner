const { isString } = require('lodash')

function natureOfParenthood (data) {
  return data['nature-of-parenthood']
}

function typeOfAdoption (data) {
  return data['type-of-adoption']
}

function isBirth (data) {
  if (isString(data)) {
    return data === 'birth'
  } else {
    return natureOfParenthood(data) === 'birth'
  }
}

function isAdoption (data) {
  if (isString(data)) {
    return data === 'adoption'
  } else {
    return natureOfParenthood(data) === 'adoption'
  }
}

function isUkAdoption (data) {
  return isAdoption(data) && (typeOfAdoption(data) === 'uk')
}

function isOverseasAdoption (data) {
  return isAdoption(data) && (typeOfAdoption(data) === 'overseas')
}

function isSurrogacy (data) {
  if (isString(data)) {
    return data === 'surrogacy'
  } else {
    return natureOfParenthood(data) === 'surrogacy'
  }
}

function earliestPrimaryLeaveWeek (data) {
  if (isBirth(data)) {
    return -11
  } else if (isUkAdoption(data)) {
    return -2
  } else {
    return 0
  }
}

function parentName (data, currentParent) {
  return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
}

function parentNameForUrl (data, parent) {
  return parentName(data, parent).split(' ').join('-')
}

function primaryName (data) {
  if (isBirth(data)) {
    return 'mother'
  } else if (isAdoption(data)) {
    return 'primary adopter'
  } else {
    return 'parental order parent'
  }
}

function secondaryName (data) {
  return 'partner'
}

function primaryUrlName (data) {
  if (isBirth(data)) {
    return 'mother'
  } else if (isAdoption(data)) {
    return 'primary-adopter'
  } else {
    return 'parental-order-parent'
  }
}

function isYes (dataField) {
  return dataField === 'yes'
}

function isNo (dataField) {
  return dataField === 'no'
}

module.exports = {
  natureOfParenthood,
  typeOfAdoption,
  parentName,
  currentParentName: parentName, // Alias
  parentNameForUrl,
  primaryName,
  primaryUrlName,
  secondaryName,
  isAdoption,
  isUkAdoption,
  isOverseasAdoption,
  isBirth,
  isSurrogacy,
  earliestPrimaryLeaveWeek,
  isYes,
  isNo
}
