const { test: base } = require('@playwright/test')
const { commonSetup } = require('../../../helpers/plannerSetup')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    const primaryParent = {
      name: 'mother',
      splEligible: 'Yes',
      splPayEligible: 'Yes'
    }
    const secondaryParent = {
      name: 'partner',
      splEligible: 'Yes',
      splPayEligible: 'Yes'
    }
    await commonSetup(page, baseURL, 'birth', primaryParent, secondaryParent)
    await use(page)
  }
})

module.exports = test