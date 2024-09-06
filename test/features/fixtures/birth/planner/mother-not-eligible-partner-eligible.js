const { test: base } = require('@playwright/test')
const { commonSetup } = require('../../../helpers/plannerSetup')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    const primaryParent = {
      name: 'mother',
      splEligible: 'No',
      splPayEligible: 'No',
      materinitAllowanceEligible: 'Yes'
    }
    const secondaryParent = {
      name: 'partner',
      splEligible: 'Yes',
      splPayEligible: 'Yes'
    }
    const additionalLeaveQuestions = {
      primaryParentLeaveEligible: false,
      secondaryParentLeaveEligible: true
    }
    await commonSetup(
      page,
      baseURL,
      'birth',
      primaryParent,
      secondaryParent,
      additionalLeaveQuestions
    )
    await use(page)
  }
})

module.exports = test
