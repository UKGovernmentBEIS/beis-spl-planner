const { test: base } = require('@playwright/test')
const { commonSetup } = require('../../../helpers/plannerSetup')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    const primaryParent = {
      name: 'parental order parent',
      splEligible: 'Yes',
      splPayEligible: 'Yes'
    }
    const secondaryParent = {
      name: 'partner',
      splEligible: 'No',
      splPayEligible: 'No'
    }
    const additionalLeaveQuestions = {
      primaryParentLeaveEligible: true,
      secondaryParentLeaveEligible: false
    }
    await commonSetup(
      page,
      baseURL,
      'surrogacy',
      primaryParent,
      secondaryParent,
      additionalLeaveQuestions
    )
    await use(page)
  }
})

module.exports = test
