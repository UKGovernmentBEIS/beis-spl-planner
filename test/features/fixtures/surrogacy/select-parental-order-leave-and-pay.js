const SelectSurrogacy = require('./select-surrogacy')

const test = SelectSurrogacy.extend({
  setupParentalOrder: async ({ setupSurrogacyPage: page }, use) => {
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
