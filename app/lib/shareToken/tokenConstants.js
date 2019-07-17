const commonPolicies = ['spl', 'shpp', 'initial-leave', 'initial-pay']

const policies = {
  primary: commonPolicies.concat('maternity-allowance'),
  secondary: commonPolicies
}

module.exports = {
  parents: ['primary', 'secondary'],
  entitlements: ['leave', 'pay'],
  separator: '+',
  policies
}
