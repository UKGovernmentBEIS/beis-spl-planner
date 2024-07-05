const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/all-eligible')

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

  test('Father can take only 2 weeks leave', async ({ setupPlannerPage: page }) => {
    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 12)

    const remainingLeave = await page.textContent('#sidebar-information p:nth-child(8) span strong')
    expect(remainingLeave).toBe('0')
  })

  test('Father can take 2 weeks leave separated by x number of weeks', async ({ setupPlannerPage: page }) => {
    for (let week = 13; week < 23; week++) { // <- Select 10 weeks of maternity leave first
      await selectLeave(page, 'mother', week)
    }

    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 15)

    const remainingLeave = await page.textContent('#sidebar-information p:nth-child(8) span strong')
    expect(remainingLeave).toBe('0')
  })

  test('SPL starts for both when mother takes SPL', async ({ setupPlannerPage: page }) => {
    await selectLeave(page, 'mother', 13) // <- Mother takes first week
    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 14) // <- Father takes second week

    const fathersLeave = await page.textContent('#calendar table tbody tr:nth-child(21) td.govuk-table__cell.leave.shared div div.govuk-body.no-margin')
    expect(fathersLeave).toContain('Shared Parental Leave')
  })
})
