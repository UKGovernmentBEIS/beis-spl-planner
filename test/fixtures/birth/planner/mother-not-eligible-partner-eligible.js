const { test: base } = require('@playwright/test')

const test = base.extend({
  setupPlannerPage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.check("input[value='birth']")
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('No').click()
    await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the mother eligible for Maternity Leave?' }).getByLabel('No').click()
    await page.getByRole('group', { name: 'Is the mother eligible for Statutory Maternity Pay?' }).getByLabel('No').click()
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the mother eligible for Maternity Allowance?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')

    const today = new Date()

    const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

    const day = threeMonthsAgo.getDate()
    const month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
    const year = threeMonthsAgo.getFullYear()

    await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
    await page
      .getByRole('textbox', { name: 'Month' })
      .fill(month.toString())
    await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

    await page.click('button:text("Continue")')

    await page.getByRole('link', { name: 'Skip this question' }).click()

    await use(page)
  }
})

module.exports = test
