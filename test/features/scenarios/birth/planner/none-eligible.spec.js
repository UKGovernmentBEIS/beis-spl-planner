const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/none-eligible')
const checkUrl = require('../../../helpers/general')
const textConstants = require('../../../utils/constants/textConstants')

test.describe('Birth > No Eligibility > Planner', () => {
  test.beforeEach(async ({ setupPlannerPageNoneEligible }) => {})

  test('should have correct URL', async ({
    setupPlannerPageNoneEligible: page
  }) => {
    await checkUrl(page, '/not-eligible')
  })

  test('correct page displayed', async ({
    setupPlannerPageNoneEligible: page
  }) => {
    await expect(
      page.getByRole('heading', {
        name: textConstants.neitherEligibleTitle
      })
    ).toBeVisible()
  })

  test('should display error if "planner" is entered into URL', async ({
    setupPlannerPageNoneEligible: page
  }) => {
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
