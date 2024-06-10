const { expect } = require('@playwright/test')
const test = require('../../fixtures/adoption/select-uk-adoption-and-SPL-and-SSPP')

test.describe('when "adoption" then "UK Adoption" is selected on "nature-of-parenthood"', () => {
  test.beforeEach(async ({ setupUKAdoptionPage }) => {})

  test('should have url', async ({ setupUKAdoptionPage: page }) => {
    await expect(page.url()).toEqual('http://localhost:3000/eligibility/partner/shared-parental-leave-and-pay')
  })

  test('should have title', async ({ setupUKAdoptionPage: page }) => {
    await expect(
      page.getByRole('heading', { name: 'Partner’s leave and pay' })
    ).toBeVisible()
  })

  test.describe('with the form buttons', () => {
    test('radio buttons should be clickable', async ({ setupUKAdoptionPage: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes')).toBeChecked()

      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await expect(page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes')).toBeChecked()
    })

    test('continue button should be clickable', async ({ setupUKAdoptionPage: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()

      await page.click('button:text("Continue")') // <- Click on continue button

      await expect(page.getByRole('link', { name: 'check if you can get leave and pay when you have a child' })).toBeVisible()
    })

    test('should show error message when radio button is not selected', async ({ setupUKAdoptionPage: page }) => {
      await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

      await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
      await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Leave' })).toBeVisible() // <- Displays an error
      await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error
    })
  })

  test.describe('and "UK Adoption" is selected and SPL and SSPP', () => {
    test('correct page displays when options are both yes', async ({ setupAdoptionPage: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When will, or when did the child start to live with you?'
        })
      ).toBeVisible()
    })

    test('correct page displays when options are no then no', async ({ setupAdoptionPage: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await page.getByRole('group', { name: 'Is the partner eligible for Paternity Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Paternity Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When will, or when did the child start to live with you?'
        })
      ).toBeVisible()
    })

    test('correct page displays when options are no then yes', async ({ setupAdoptionPage: page }) => {
      await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await page.getByRole('group', { name: 'Is the partner eligible for Paternity Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the partner eligible for Statutory Paternity Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'When will, or when did the child start to live with you?'
        })
      ).toBeVisible()
    })
  })
})
