const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/mother-not-eligible-partner-eligible')
const selectLeave = require('../../../utils/plannerSelectLeave')

test.describe('Planner page', () => {
  test.beforeEach(async ({ setupPlannerPage }) => {})

  test('should have url', async ({ setupPlannerPage: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/planner`)
  })

  test('Partner can take 2 weeks paternity leave', async ({ setupPlannerPage: page }) => {
    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 12)

    const remainingLeave = await page.textContent('#sidebar-information div p:nth-child(7) span strong')
    expect(remainingLeave).toBe('0')
  })

  test('Partner can take up to 39 weeks of paid leave', async ({ setupPlannerPage: page }) => {
    for (let week = 11; week < 50; week++) { // <- Loop 50 times as the 52 weeks includes 2 compulsory leave weeks
      await selectLeave(page, 'father', week)
    }

    const remainingLeave = await page.textContent('#info-alert div:nth-child(2) span strong')
    expect(remainingLeave).toBe('0')
  })
})
