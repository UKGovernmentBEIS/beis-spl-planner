const moment = require('moment')

const birthSplStartsCorrectly = {
  natureOfParenthood: 'birth',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 0, leaveWeeks: [1, 2, 3, 12], payWeeks: [1, 2, 11, 12] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: true,
      statutoryLeave: false
    }
  }
}

module.exports = birthSplStartsCorrectly
