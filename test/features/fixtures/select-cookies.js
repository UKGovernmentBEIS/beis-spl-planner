const { test: base } = require('@playwright/test')

const test = base.extend({
  setUpCookiesPage: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}`)
    await page.click('body > footer > div > div > div.govuk-footer__meta-item.govuk-footer__meta-item--grow > ul > li:nth-child(1) > a')
    await use(page)
  }
})

module.exports = test
