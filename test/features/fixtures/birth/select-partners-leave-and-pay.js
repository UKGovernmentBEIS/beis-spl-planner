const SelectMothersLeaveAndPay = require('./select-mothers-leave-and-pay')

const test = SelectMothersLeaveAndPay.extend({
  setupPartnersLeaveAndPay: async ({ setupMothersLeaveAndPay: page }, use) => {
    await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click({ force: true })
    await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click({ force: true })
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
