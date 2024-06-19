const { expect } = require('@playwright/test')
const test = require('../../fixtures/birth/select-mothers-leave-and-pay')

test.describe('when "surrogacy" then "parental order parents leave and pay" is selected on "nature-of-parenthood"', () => {
  test.beforeEach(async ({ setupMothersLeaveAndPay }) => {})

  test('should have url', async ({ setupMothersLeaveAndPay: page }) => {
    await expect(page.url()).toEqual('http://localhost:3000/eligibility/partner/shared-parental-leave-and-pay')
  })

  test('should have title', async ({ setupMothersLeaveAndPay: page }) => {
    await expect(
      page.getByRole('heading', { name: 'Partner’s leave and pay' })
    ).toBeVisible()
  })

  test.describe('with the form buttons', () => {
    test('radio buttons should be clickable', async ({ setupMothersLeaveAndPay: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes')).toBeChecked()

      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes')).toBeChecked()
    })

    test('continue button should be clickable', async ({ setupMothersLeaveAndPay: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()

      await page.click('button:text("Continue")') // <- Click on continue button

      await expect(page.getByRole('link', { name: 'check if you can get leave and pay when you have a child' })).toBeVisible()
    })

    test('should show error message when radio button is not selected', async ({ setupMothersLeaveAndPay: page }) => {
      await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

      await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
      await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Leave' })).toBeVisible() // <- Displays an error
      await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error
    })
  })

  test.describe('and "parental order parents leave and pay" is selected', () => {
    test('correct page displays when options are both yes', async ({ setupMothersLeaveAndPay: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When is the baby due, or when was the baby born?'
        })
      ).toBeVisible()
    })

    test('correct page displays when options are no then no', async ({ setupMothersLeaveAndPay: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await page.getByRole('group', { name: 'Is the partner eligible for Paternity Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Paternity Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When is the baby due, or when was the baby born?'
        })
      ).toBeVisible()
    })

    test('correct page displays when options are no then yes', async ({ setupMothersLeaveAndPay: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await page.getByRole('group', { name: 'Is the partner eligible for Paternity Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Paternity Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When is the baby due, or when was the baby born?'
        })
      ).toBeVisible()
    })
  })
})
