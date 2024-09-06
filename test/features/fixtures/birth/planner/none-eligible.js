const { test: base } = require('@playwright/test')

const test = base.extend({
  setupPlannerPageNoneEligible: async ({ page, baseURL }, use) => {
    // Nature of parenthood (birth/adoption/surrogacy)
    await page.goto(`${baseURL}`)
    await page.check("input[value='birth']")
    await page.click('button:text("Continue")')

    // eligibility/mother/shared-parental-leave-and-pay
    await page
      .getByRole('group', {
        name: 'Is the mother eligible for Shared Parental Leave?'
      })
      .getByLabel('No')
      .click()
    await page
      .getByRole('group', {
        name: 'Is the mother eligible for Statutory Shared Parental Pay?'
      })
      .getByLabel('No')
      .click()
    await page.click('button:text("Continue")')

    // eligibility/mother/initial-leave-and-pay
    await page
      .getByRole('group', {
        name: 'Is the mother eligible for Maternity Leave?'
      })
      .getByLabel('No')
      .click()
    await page
      .getByRole('group', {
        name: 'Is the mother eligible for Statutory Maternity Pay?'
      })
      .getByLabel('No')
      .click()
    await page.click('button:text("Continue")')

    // eligibility/mother/maternity-allowance
    await page
      .getByRole('group', {
        name: 'Is the mother eligible for Maternity Allowance?'
      })
      .getByLabel('No')
      .click()
    await page.click('button:text("Continue")')

    await use(page)
  }
})

module.exports = test
