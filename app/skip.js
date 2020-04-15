const { isYes, isAdoption, isSurrogacy } = require('../common/lib/dataUtils')
const delve = require('dlv')

function typeOfAdoption (req) {
  return !isAdoption(req.session.data)
}

function initialLeaveAndPay (req) {
  const splEligible = delve(req.session.data, ['primary', 'spl-eligible'])
  const shppEligible = delve(req.session.data, ['primary', 'shpp-eligible'])
  return isYes(splEligible) && isYes(shppEligible)
}

function maternityAllowance (req) {
  if (isAdoption(req.session.data)) {
    return true
  }
  if (isSurrogacy(req.session.data)) {
    return true
  }
  if (initialLeaveAndPay(req)) {
    return true
  }
  const maternityLeaveEligible = delve(req.session.data, ['primary', 'initial-leave-eligible'])
  if (isYes(maternityLeaveEligible)){
    return true
  }
  const initialPayEligible = delve(req.session.data, ['primary', 'initial-pay-eligible'])
  return isYes(initialPayEligible)
}

function paternityLeaveAndPay (req) {
  const splEligible = delve(req.session.data, ['secondary', 'spl-eligible'])
  const shppEligible = delve(req.session.data, ['secondary', 'shpp-eligible'])
  return isYes(splEligible) && isYes(shppEligible)
}

module.exports = {
  typeOfAdoption,
  initialLeaveAndPay,
  maternityAllowance,
  paternityLeaveAndPay
}
