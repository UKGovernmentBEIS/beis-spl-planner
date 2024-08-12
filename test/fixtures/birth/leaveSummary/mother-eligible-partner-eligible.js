const { test: base } = require('@playwright/test')

// Utility function to select a leave week for a given parent
async function selectLeave (page, parent, week) {
  await page.click(`td[data-row="${week}"][data-column="${parent === 'mother' ? 0 : 2}"]`)
}

const test = base.extend({
  setupLeavePage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.check("input[value='birth']")
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')

    await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')

// -------------------------------------------------------------------

    const today = new Date()

    const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

    const day = threeMonthsAgo.getDate()
    const month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
    const year = threeMonthsAgo.getFullYear()

    await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())

    await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())

    await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

    await page.click('button:text("Continue")')

    await page.getByRole('link', { name: 'Skip this question' }).click()

// -------------------------------------------------------------------

    // Select mother's leave
    for (let week = 13; week < 38; week++){
      await selectLeave(page, 'mother', week)
    }

    // Select partner's leave
    for (let week = 11; week < 25; week++){
      await selectLeave(page, 'partner', week)
    }

    // await page.click('button:text("Continue")')
    await page.locator('#leave-and-pay div.govuk-grid-row.print-hide.js-show div button').click()
  }
})

module.exports = test
