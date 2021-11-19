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

function isPrimaryIneligible (data) {
  const primarySplEligible = delve(data, ['primary', 'spl-eligible'])
  const primaryShppEligible = delve(data, ['primary', 'shpp-eligible'])
  const primaryInitialLeaveEligible = delve(data, ['primary', 'initial-leave-eligible'])
  const primaryInitialPayEligible = delve(data, ['primary', 'initial-pay-eligible'])
  if (isBirth(data)) {
    const primaryMaternityAllowEligible = delve(data, ['primary', 'maternity-allowance-eligible'])
    return this.isNo(primarySplEligible) &&
           this.isNo(primaryShppEligible) &&
           this.isNo(primaryInitialLeaveEligible) &&
           this.isNo(primaryInitialPayEligible) &&
           this.isNo(primaryMaternityAllowEligible)
  } else {
    return this.isNo(primarySplEligible) &&
           this.isNo(primaryShppEligible) &&
           this.isNo(primaryInitialLeaveEligible) &&
           this.isNo(primaryInitialPayEligible)
  }
}

function shouldSetNewFirstSplWeek (checked, parent, leaveType, newWeek, previousWeek) {
  return checked && parent === 'primary' && isLeaveTypeOther(leaveType) && newWeek < previousWeek && newWeek > 0
}

function shouldResetFirstSplWeek (parent, leaveType, newWeek, previousWeek) {
  return parent === 'primary' && isLeaveTypeShared(leaveType) && newWeek === previousWeek
}

function isLeaveTypeOther (leaveType) {
  return leaveType === 'adoption' || leaveType === 'maternity'
}

function isLeaveTypeShared (leaveType) {
  return leaveType === 'shared'
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
  splBlockPlanningOrder,
  isPrimaryIneligible,
  isLeaveTypeShared,
  isLeaveTypeOther,
  shouldSetNewFirstSplWeek,
  shouldResetFirstSplWeek
}
