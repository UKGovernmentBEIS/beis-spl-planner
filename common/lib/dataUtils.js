function isBirth (data) {
  return data['birth-or-adoption'] === 'birth'
}

function isAdoption (data) {
  return data['birth-or-adoption'] === 'adoption'
}

function parentName (data, currentParent) {
  return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
}

function primaryName (data) {
  return isBirth(data) ? 'mother' : 'primary adopter'
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
  isYes,
  isNo
}
