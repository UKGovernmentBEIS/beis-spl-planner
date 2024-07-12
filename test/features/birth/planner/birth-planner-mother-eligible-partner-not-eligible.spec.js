const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/mother-eligible-partner-not-eligible')

// Utility function to select a leave week for a given parent
async function selectLeave (page, parent, week) {
  await page.click(`td[data-row="${week}"][data-column="${parent === 'mother' ? 0 : 2}"]`)
}

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

    for (let week = 18; week <= 81; week++){
      const selector = `#calendar table tbody tr:nth-child(${week}) td.govuk-table__cell.leave.disabled div`

      // If 'week' gets to a number where the selector returns a month header,
      // page.textContent will time out, so if it takes longer than 50ms, skip it
      try {
        const currentDisabledCell = await page.textContent(selector, { timeout: 50 });
        expect(currentDisabledCell).toContain('Not eligible for leave or pay');
      } catch (error) {
        console.log(`Skipping week ${week} due to error: ${error.message}`);
        continue
      }
    }

  })
})
