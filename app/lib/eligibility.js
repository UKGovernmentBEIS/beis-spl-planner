const { isYes, isBirth } = require('../../common/lib/dataUtils')

function parseEligibilityFromData (data) {
  const eligibilities = {}
  const parents = ['primary', 'secondary']

  parents.forEach(parent => {
    eligibilities[parent] = {
      spl: isEligible(data, parent, 'spl'),
      shpp: isEligible(data, parent, 'shpp'),
      statutoryLeave: isEligible(data, parent, 'initial-leave') || isEligible(data, parent, 'spl'),
      statutoryPay: isEligible(data, parent, 'initial-pay') || isEligible(data, parent, 'shpp')
    }
  })
  eligibilities.primary.maternityAllowance = getMaternityAllowanceEligibility(data)
  return eligibilities
}

function isEligible (data, parent, policy) {
  return isYes(data[parent][`${policy}-eligible`])
}

function getMaternityAllowanceEligibility (data) {
  return isBirth(data) &&
    (isEligible(data, 'primary', 'shpp') || isEligible(data, 'primary', 'initial-pay') || isEligible(data, 'primary', 'maternity-allowance'))
}

module.exports = {
  parseEligibilityFromData
}
