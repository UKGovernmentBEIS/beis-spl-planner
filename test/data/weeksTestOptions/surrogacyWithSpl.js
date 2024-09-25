const moment = require('moment')

const surrogacyWithSpl = {
  natureOfParenthood: 'surrogacy',
  typeOfAdoption: undefined,
  startWeek: moment('2024-01-01'),
  primary: { firstSplWeek: 10, leaveWeeks: [1, 2, 3], payWeeks: [1, 2] },
  secondary: { leaveWeeks: [], payWeeks: [] },
  eligibility: {
    primary: {
      spl: true,
      statutoryLeave: true,
      shpp: true,
      maternityAllowance: false
    },
    secondary: {
      spl: false,
      statutoryLeave: false
    }
  }
}

module.exports = surrogacyWithSpl
