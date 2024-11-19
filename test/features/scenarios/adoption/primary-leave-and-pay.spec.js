const { expect } = require('@playwright/test')
const test = require('../../fixtures/adoption/select-adoption')
const checkUrl = require('../../helpers/general')

test.describe('when "adoption" is selected on "nature-of-parenthood"', () => {
  test.beforeEach(async ({ setupAdoptionPage }) => {})

  test('should have url', async ({ setupAdoptionPage: page }) => {
    await checkUrl(page, '/type-of-adoption')
  })

  test('should have title', async ({ setupAdoptionPage: page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Are you adopting the child from the UK or from overseas?'
      })
    ).toBeVisible()
  })

  test.describe('with the form buttons', () => {
    test('radio buttons should be clickable', async ({
      setupAdoptionPage: page
    }) => {
      await page.check("input[value='uk']", { force: true })
      await expect(page.locator("input[value='uk']")).toBeChecked()

      await page.check("input[value='overseas']", { force: true })
      await expect(page.locator("input[value='overseas']")).toBeChecked()
    })

    test('continue button should be clickable', async ({
      setupAdoptionPage: page
    }) => {
      await page.check("input[value='uk']", { force: true })

      await page.click('button:text("Continue")') // <- Click on continue button

      await expect(
        page.getByRole('heading', {
          name: 'Primary adopter’s leave and pay'
        })
      ).toBeVisible()
    })

    test('should show error message when radio button is not selected', async ({
      setupAdoptionPage: page
    }) => {
      await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

      await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
      await expect(
        page.getByRole('link', {
          name: 'Select either UK or overseas adoption'
        })
      ).toBeVisible() // <- Displays an error
    })
  })

  test.describe('and "UK Adoption" is selected', () => {
    test.beforeEach(async ({ setupAdoptionPage: page }) => {
      await page.check("input[value='uk']", { force: true })
      await page.click('button:text("Continue")')
    })

    test('correct page displays', async ({ setupAdoptionPage: page }) => {
      await expect(
        page.getByText('Primary adopter’s leave and pay')
      ).toBeVisible()
    })

    test('correct page displays when next page buttons are both yes', async ({
      setupAdoptionPage: page
    }) => {
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Shared Parental Leave?'
        })
        .getByLabel('Yes')
        .click({ force: true })
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
        })
        .getByLabel('Yes')
        .click({ force: true })
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'Partner’s leave and pay'
        })
      ).toBeVisible()
    })

    test('correct page displays when next page buttons are both no', async ({
      setupAdoptionPage: page
    }) => {
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Shared Parental Leave?'
        })
        .getByLabel('No')
        .click({ force: true })
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
        })
        .getByLabel('No')
        .click({ force: true })
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('link', {
          name: 'check if you can get leave and pay when you have a child'
        })
      ).toBeVisible()
    })

    test('correct page displays when next page buttons are yes then no', async ({
      setupAdoptionPage: page
    }) => {
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Shared Parental Leave?'
        })
        .getByLabel('Yes')
        .click({ force: true })
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
        })
        .getByLabel('No')
        .click({ force: true })
      await page.click('button:text("Continue")')

      await expect(
        page.getByText(
          'Is the primary adopter eligible for Statutory Adoption Pay?'
        )
      ).toBeVisible()
    })

    test('correct page displays when next page buttons are no then yes', async ({
      setupAdoptionPage: page
    }) => {
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Shared Parental Leave?'
        })
        .getByLabel('No')
        .click({ force: true })
      await page
        .getByRole('group', {
          name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?'
        })
        .getByLabel('Yes')
        .click({ force: true })
      await page.click('button:text("Continue")')

      await expect(
        page.getByText('Is the primary adopter eligible for Adoption Leave?')
      ).toBeVisible()
    })
  })
})
