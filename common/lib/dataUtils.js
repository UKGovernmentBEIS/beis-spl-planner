const { isString } = require('lodash')

function natureOfParenthood (data) {
  return data['nature-of-parenthood']
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
  } else if (isAdoption(data)) {
    return -2
  } else {
    return 0
  }
}

function parentName (data, currentParent) {
  return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
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

function isYes (dataField) {
  return dataField === 'yes'
}

function isNo (dataField) {
  return dataField === 'no'
}

module.exports = {
  natureOfParenthood,
  parentName,
  primaryName,
  secondaryName,
  isAdoption,
  isBirth,
  isSurrogacy,
  earliestPrimaryLeaveWeek,
  isYes,
  isNo
}
