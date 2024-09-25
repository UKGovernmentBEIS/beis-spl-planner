const test = require('../../../fixtures/surrogacy/planner/mother-eligible-partner-not-eligible')
const {
  selectLeaveRange
} = require('../../../utils/plannerUtils/plannerSelectLeave')
const { assertLeaveText } = require('../../../helpers/plannerHelpers')
const checkUrl = require('../../../helpers/general')
const plannerSelectors = require('../../../utils/selectors/planner')
const textConstants = require('../../../utils/constants/textConstants')

test.describe('Birth > Parental order parent Eligible, Partner Not Eligible > Planner', () => {
  test.beforeEach(async ({ setupPlannerPage }) => {})

  test('should have correct URL', async ({ setupPlannerPage: page }) => {
    await checkUrl(page, '/planner')
  })

  test.describe('Parental order parent', () => {
    test('Parental order parent can take up to 52 weeks leave', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'mother', 2, 52)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.motherNoRemainingLeave
      )
    })

    test('Parental order parent has 2 weeks of compulsory leave that cannot be unselected', async ({
      setupPlannerPage: page
    }) => {
      await selectLeaveRange(page, 'mother', 0, 1)

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.compulsorySurrogacyLeaveNotice
      )
    })
  })
})
