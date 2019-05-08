const dlv = require('dlv')
const _ = require('lodash')

const MOTHER = Object.freeze({
  name: 'mother',
  leaveType: 'maternity'
})

const PRIMARY_ADOPTER = Object.freeze({
  name: 'primary adopter',
  leaveType: 'adoption'
})

const PARTNER = Object.freeze({
  name: 'partner',
  leaveType: 'paternity'
})

function getWeeksArray (data, parent, property) {
  return _.castArray(dlv(data, [parent, property], [])).map(i => parseInt(i))
}

function nameAndLeaveType (data, parent) {
  if (parent === 'secondary') {
    return PARTNER
  } else if (data['birth-or-adoption'] === 'birth') {
    return MOTHER
  } else {
    return PRIMARY_ADOPTER
  }
}

module.exports = {
  getWeeksArray,
  nameAndLeaveType
}
