const { test: base } = require('@playwright/test')

const test = base.extend({
  setupBirthPage: async ({ page }, use) => {
    await page.goto('http://localhost:3000')
    await page.check("input[value='birth']")
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
