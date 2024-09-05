const { test: base } = require('@playwright/test')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    // nature-of-parenthood
    await page.goto(`${baseURL}`)
    await page.check("input[value='adoption']")
    await page.click('button:text("Continue")')

    // type-of-adoption
    await page.getByLabel('UK Adoption').click()
    await page.click('button:text("Continue")')

    // eligibility/primary-adopter/shared-parental-leave-and-pay
    await page
      .getByRole('group', {
        name: 'Is the primary adopter eligible for Shared Parental Leave?'
      })
      .getByLabel('Yes')
      .click()
    await page
      .getByRole('group', {
        name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
      })
      .getByLabel('Yes')
      .click()
    await page.click('button:text("Continue")')

    // eligibility/partner/shared-parental-leave-and-pay
    await page
      .getByRole('group', {
        name: 'Is the partner eligible for Shared Parental Leave?'
      })
      .getByLabel('Yes')
      .click()
    await page
      .getByRole('group', {
        name: 'Is the partner eligible for Statutory Shared Parental Pay?'
      })
      .getByLabel('Yes')
      .click()
    await page.click('button:text("Continue")')

    // start-date
    const today = new Date()
    const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
    const day = threeMonthsAgo.getDate()
    const month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
    const year = threeMonthsAgo.getFullYear()

    await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
    await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
    await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

    await page.click('button:text("Continue")')

    // parent-salaries
    await page.getByRole('link', { name: 'Skip this question' }).click()
    await use(page)
  }
})

module.exports = test
