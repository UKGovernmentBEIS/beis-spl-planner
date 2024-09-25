const moment = require('moment')

const birthShppOnly = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 0, leaveWeeks: [0, 1], payWeeks: [0, 1] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: false,
      statutoryLeave: false,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: false,
      statutoryLeave: false
    }
  }
}

module.exports = birthShppOnly
