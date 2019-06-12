function initialLeaveAndPay (req) {
  const {
    'spl-eligible': splEligible,
    'shpp-eligible': shppEligible
  } = req.session.data.primary
  return splEligible === 'yes' && shppEligible === 'yes'
}

function maternityAllowance (req) {
  if (req.session.data['birth-or-adoption'] === 'adoption') {
    return true
  }
  if (initialLeaveAndPay(req)) {
    return true
  }
  console.log(req.session.data.primary['initial-pay-eligible'])
  return req.session.data.primary['initial-pay-eligible'] === 'yes'
}

module.exports = {
  initialLeaveAndPay,
  maternityAllowance
}
