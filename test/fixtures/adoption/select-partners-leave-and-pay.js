const { test: base } = require('@playwright/test')
const SelectUKAdoption = require('./select-uk-adoption-and-SPL-and-SSPP')

const test = SelectUKAdoption.extend({
  setupPartnersLeaveAndPay: async ({ setupUKAdoptionPage: page }, use) => {
    await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
