const moment = require('moment')

const birthMaternityAllowanceOnly = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 0, leaveWeeks: [0, 1], payWeeks: [0, 1] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: false,
      statutoryLeave: true,
      shpp: false,
      maternityAllowance: true
    },
    secondary: {
      spl: false,
      statutoryLeave: true
    }
  }
}

module.exports = birthMaternityAllowanceOnly
