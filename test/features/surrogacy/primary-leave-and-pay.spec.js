const { expect } = require('@playwright/test')
const test = require('../../fixtures/surrogacy/select-surrogacy')

test.describe('when "surrogacy" is selected on "nature-of-parenthood"', () => {
  test.beforeEach(async ({ setupSurrogacyPage }) => {})

  test('should have url', async ({ setupSurrogacyPage: page }) => {
    await expect(page.url()).toBe('http://localhost:3000/eligibility/parental-order-parent/shared-parental-leave-and-pay')
  })

  test('should have title', async ({ setupSurrogacyPage: page }) => {
    await expect(
      await page.getByRole('heading', { name: 'Parental order parent’s leave and pay' })
    ).toBeVisible()
  })

  test.describe('with the form buttons', () => {
    test('radio buttons should be clickable', async ({ setupSurrogacyPage: page }) => {
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes')).toBeChecked()

      await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes')).toBeChecked()
    })

    test('continue button should be clickable', async ({ setupSurrogacyPage: page }) => {
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(
        await page.getByRole('heading', {
          name: 'Partner’s leave and pay'
        })
      ).toBeVisible()
    })

    test('should show error message when radio button is not selected', async ({ setupSurrogacyPage: page }) => {
      await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

      await expect(await page.getByText('There is a problem')).toBeVisible() // <- Displays an error
      await expect(await page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Leave' })).toBeVisible() // <- Displays an error
      await expect(await page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error
    })
  })

  test('correct page displays when next page buttons are both no', async ({ setupSurrogacyPage: page }) => {
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('No').click()
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
    await page.click('button:text("Continue")')

    await expect(
      await page.getByRole('heading', {
        name: 'Parental order parent’s leave and pay'
      })
    ).toBeVisible()
  })

  test('correct page displays when next page buttons are yes then no', async ({ setupSurrogacyPage: page }) => {
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
    await page.click('button:text("Continue")')

    await expect(await page.getByText('Is the parental order parent eligible for Statutory Adoption Pay?')).toBeVisible()
  })

  test('correct page displays when next page buttons are no then yes', async ({ setupSurrogacyPage: page }) => {
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('No').click()
    await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
    await page.click('button:text("Continue")')

    await expect(await page.getByText('Is the parental order parent eligible for Adoption Leave?')).toBeVisible()
  })
})
