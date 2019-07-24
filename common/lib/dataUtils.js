function isBirth (data) {
  return data['nature-of-parenthood'] === 'birth'
}

function isAdoption (data) {
  return data['nature-of-parenthood'] === 'adoption'
}

function earliestPrimaryLeaveWeek (data) {
  return isBirth(data) ? -11 : -2
}

function isSurrogacy (data) {
  return data['nature-of-parenthood'] === 'surrogacy'
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
  parentName,
  primaryName,
  secondaryName,
  isAdoption,
  isBirth,
  earliestPrimaryLeaveWeek,
  isSurrogacy,
  isYes,
  isNo
}
