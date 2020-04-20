const _ = require('lodash')
const delve = require('dlv')

function natureOfParenthood (data) {
  return data['nature-of-parenthood']
}

function typeOfAdoption (data) {
  return data['type-of-adoption']
}

function birthOrPlacement (data) {
  return isAdoption(data) ? 'placement' : 'birth'
}

function isBirth (data) {
  if (_.isString(data)) {
    return data === 'birth'
  } else {
    return natureOfParenthood(data) === 'birth'
  }
}

function isAdoption (data) {
  if (_.isString(data)) {
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
  if (_.isString(data)) {
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

function splBlockPlanningOrder (data) {
  return _.castArray(delve(data, 'leave-blocks.spl-block-planning-order', []))
}

module.exports = {
  natureOfParenthood,
  typeOfAdoption,
  birthOrPlacement,
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
  isNo,
  splBlockPlanningOrder
}
