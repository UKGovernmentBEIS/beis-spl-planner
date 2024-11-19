const { test: base } = require('@playwright/test')

const test = base.extend({
  setupSurrogacyPage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.check("input[value='surrogacy']", { force: true })
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
