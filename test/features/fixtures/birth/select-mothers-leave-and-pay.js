const SelectBirth = require('./select-birth')

const test = SelectBirth.extend({
  setupMothersLeaveAndPay: async ({ setupBirthPage: page }, use) => {
    await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click({ force: true })
    await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click({ force: true })
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
