const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/planner/all-eligible')
const {
  selectLeave,
  selectLeaveRange
} = require('../../../utils/plannerUtils/plannerSelectLeave')
const { assertRemainingLeave } = require('../../../helpers/plannerHelpers')
const checkUrl = require('../../../helpers/general')
const plannerSelectors = require('../../../utils/selectors/planner')
const textConstants = require('../../../utils/constants/textConstants')

test.describe('Birth > All Eligible > Planner', () => {
  test.beforeEach(async ({ setupPlannerPage }) => {})

  test('should have correct URL', async ({ setupPlannerPage: page }) => {
    await checkUrl(page, '/planner')
  })

  test('Mother can take up to 52 weeks leave', async ({
    setupPlannerPage: page
  }) => {
    await selectLeaveRange(page, 'mother', 13, 63)

    await assertRemainingLeave(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.motherNoRemainingLeave
    )
  })

  test('Partner can take 2 weeks paternity leave', async ({
    setupPlannerPage: page
  }) => {
    await selectLeaveRange(page, 'father', 11, 12)

    await assertRemainingLeave(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.partnerNoRemainingLeave
    )
  })

  test('Father can take 2 weeks leave separated by 10 weeks', async ({
    setupPlannerPage: page
  }) => {
    await selectLeaveRange(page, 'mother', 13, 23)

    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 15)

    await assertRemainingLeave(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.partnerNoRemainingLeave
    )
  })

  test('SPL starts for both when mother takes SPL', async ({
    setupPlannerPage: page
  }) => {
    await selectLeave(page, 'mother', 13)
    await selectLeave(page, 'father', 11)
    await selectLeave(page, 'father', 14)

    const fathersLeave = await page.textContent(
      plannerSelectors.fathersLeaveCalendar
    )
    expect(fathersLeave).toContain('Shared Parental Leave')
  })
})
