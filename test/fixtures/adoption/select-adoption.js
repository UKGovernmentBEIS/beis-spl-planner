const { test: base } = require('@playwright/test')

const test = base.extend({
  setupAdoptionPage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.check("input[value='adoption']")
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
