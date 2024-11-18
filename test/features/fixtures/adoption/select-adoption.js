const { test: base } = require('@playwright/test')

const test = base.extend({
  setupAdoptionPage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.check("input[value='adoption']", { force: true })
    await page.click('button:text("Continue")', { force: true })
    await use(page)
  }
})

module.exports = test
