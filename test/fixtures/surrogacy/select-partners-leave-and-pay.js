const SelectParentOrder = require('./select-parental-order-leave-and-pay')

const test = SelectParentOrder.extend({
  setupPartnersLeaveAndPay: async ({ setupParentalOrder: page }, use) => {
    await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')
    await use(page)
  }
})

module.exports = test
