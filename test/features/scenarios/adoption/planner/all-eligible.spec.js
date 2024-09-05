const { expect } = require('@playwright/test')
const test = require('../../../fixtures/adoption/planner/uk-adoption-all-eligible')
const {
  selectLeave,
  selectLeaveRange
} = require('../../../utils/plannerUtils/plannerSelectLeave')
const { assertLeaveText } = require('../../../helpers/plannerHelpers')
const checkUrl = require('../../../helpers/general')
const plannerSelectors = require('../../../utils/selectors/planner')
const textConstants = require('../../../utils/constants/textConstants')

test.describe('Adoption > All Eligible > Planner', () => {
  test.beforeEach(async ({ setupPlannerPage }) => {})

  test('should have correct URL', async ({ setupPlannerPage: page }) => {
    await checkUrl(page, '/planner')
  })

  test.describe('Primary Adopter', () => {
    test('Primary Adopter can take up to 52 weeks leave', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'mother', 4, 54)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.motherNoRemainingLeave
      )
    })

    test('Primary Adopter has 2 weeks of compulsory leave that cannot be unselected', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'mother', 2, 3)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.compulsoryAdoptionLeaveNotice
      )
    })
  })

  test.describe('Partner', () => {
    test('Partner can take 2 weeks paternity leave', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'father', 2, 3)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.partnerNoRemainingLeave
      )
    })

    test('Partner can take 2 weeks leave separated by 10 weeks', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'mother', 4, 14)

      await selectLeave(page, 'father', 2)
      await selectLeave(page, 'father', 14)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.partnerNoRemainingLeave
      )
    })
  })

  test.describe('Shared', () => {
    test('SPL starts for both when Primary Adopter takes SPL', async ({
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
})
