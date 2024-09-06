const { test: base } = require('@playwright/test')
const { commonSetup } = require('../../../helpers/plannerSetup')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    const primaryParent = {
      name: 'primary adopter',
      leaveEligible: 'Yes',
      splEligible: 'Yes'
    }
    const secondaryParent = {
      name: 'partner',
      leaveEligible: 'Yes',
      splEligible: 'Yes'
    }
    await commonSetup(
      page,
      baseURL,
      'adoption',
      primaryParent,
      secondaryParent,
      async (page) => {
        // Type of adoption (UK Adoption specific to this route)
        await page.getByLabel('UK Adoption').click()
        await page.click('button:text("Continue")')
      }
    )

    await use(page)
  }
})

module.exports = test
