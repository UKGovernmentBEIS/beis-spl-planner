const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/none-eligible')

test.describe('planner page', () => {
  test.beforeEach(async ({ setupPlannerPageNoneEligible }) => {})

  test('should have url', async ({ setupPlannerPageNoneEligible: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/not-eligible`)
  })

  test('correct page displayed', async ({ setupPlannerPageNoneEligible: page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Neither parent is eligible for Shared Parental Leave or Pay'
      })
    ).toBeVisible()
  })

  test('should display error if "planner" is entered into URL', async ({ setupPlannerPageNoneEligible: page }) => {
    const { baseURL } = page.context()._options
    await page.goto(`${baseURL}/planner`)

    await expect(page.getByText('There is a problem')).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Select whether you are eligible for Shared Parental Leave'
      })
    ).toBeVisible()

    await expect(
      page.getByRole('link', {
        name: 'Select whether you are eligible for Shared Parental Pay'
      })
    ).toBeVisible()
  })
})
