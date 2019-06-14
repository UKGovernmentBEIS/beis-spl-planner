function isBirth (data) {
  return data['birth-or-adoption'] === 'birth'
}

function isAdoption (data) {
  return data['birth-or-adoption'] === 'adoption'
}

function isYes (dataField) {
  return dataField === 'yes'
}

function isNo (dataField) {
  return dataField === 'no'
}

module.exports = {
  isBirth,
  isAdoption,
  isYes,
  isNo
}
