const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/mother-eligible-partner-not-eligible')
const selectLeave = require('../../../utils/plannerSelectLeave')

test.describe('Planner page', () => {
  test.beforeEach(async ({ setupPlannerPage }) => {})

  test('should have url', async ({ setupPlannerPage: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/planner`)
  })

  test('Mother can take up to 52 weeks leave', async ({ setupPlannerPage: page }) => {
    for (let week = 0; week < 50; week++) { // <- Loop 50 times as the 52 weeks includes 2 compulsory leave weeks
      await selectLeave(page, 'mother', week)
    }

    const remainingLeave = await page.textContent('#info-alert div:nth-child(2) span strong')
    expect(remainingLeave).toBe('0')
  })

  test('Father cannot take any leave', async ({ setupPlannerPage: page }) => {
    const disabledCells = page.locator('.govuk-table__cell.leave.disabled')
    const disabledCellCount = await disabledCells.count()

    for (let i = 11; i < disabledCellCount; i++) { // <- Start from 11 as that's when disabled cells start to say 'Not eligible for leave and pay'
      const disabledCell = disabledCells.nth(i)

      const disabledCellTextContent = await disabledCell.textContent()
      expect(disabledCellTextContent).toContain('Not eligible for leave or pay')
    }
  })
})
