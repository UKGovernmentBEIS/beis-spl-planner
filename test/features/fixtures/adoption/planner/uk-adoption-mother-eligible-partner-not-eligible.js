const { test: base } = require('@playwright/test')
const { commonSetup } = require('../../../helpers/plannerSetup')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    const primaryParent = {
      name: 'primary adopter',
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
      'adoption',
      primaryParent,
      secondaryParent,
      additionalLeaveQuestions,
      async (page) => {
        // Type of adoption (UK Adoption specific to this route)
        await page.getByLabel('UK Adoption').click({ force: true })
        await page.click('button:text("Continue")')
      }
    )

    await use(page)
  }
})

module.exports = test
