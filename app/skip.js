const delve = require('dlv')

function initialLeaveAndPay (req) {
  const splEligible = delve(req.session.data, ['primary', 'spl-eligible'])
  const shppEligible = delve(req.session.data, ['primary', 'shpp-eligible'])
  return splEligible === 'yes' && shppEligible === 'yes'
}

function maternityAllowance (req) {
  if (req.session.data['birth-or-adoption'] === 'adoption') {
    return true
  }
  if (initialLeaveAndPay(req)) {
    return true
  }
  return delve(req.session.data, ['primary', 'initial-pay-eligible']) === 'yes'
}

function paternityLeaveAndPay (req) {
  const splEligible = delve(req.session.data, ['secondary', 'spl-eligible'])
  const shppEligible = delve(req.session.data, ['secondary', 'shpp-eligible'])
  return splEligible === 'yes' && shppEligible === 'yes'
}

module.exports = {
  initialLeaveAndPay,
  maternityAllowance,
  paternityLeaveAndPay
}
