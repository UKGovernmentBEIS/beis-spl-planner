const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/leaveSummary/mother-eligible-partner-eligible.js')
const calculateDate = require('../../../utils/dateUtils/calculateDate.js')
const assertDateLabel = require('../../../utils/dateUtils/assertDateLabel.js')
const leaveSummarySelectors = require('../../../utils/selectors/leaveSummary.js')
const checkUrl = require('../../../helpers/general')

test.describe('Leave summary page', () => {
  let calculatedLeaveDate

  test.beforeEach(async ({ setupLeavePage }) => {
    calculatedLeaveDate = await calculateDate()
  })

  test('should have the correct url', async ({ setupLeavePage: page }) => {
    await checkUrl(page, '/summary')
  })

  test('baby is due label has correct value', async ({
    setupLeavePage: page
  }) => {
    await assertDateLabel(
      page,
      leaveSummarySelectors.babyDueDate,
      calculatedLeaveDate,
      'D MMMM YYYY'
    )
  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value', async ({
      setupLeavePage: page
    }) => {
      const startOfWeek = calculatedLeaveDate.startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.maternityLeaveStarts,
        startOfWeek,
        '[week starting] D MMMM YYYY'
      )
    })

    test('maternity leave ends label has correct value', async ({
      setupLeavePage: page
    }) => {
      const endOfWeek = calculatedLeaveDate.add(26, 'weeks').endOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.maternityLeaveEnds,
        endOfWeek,
        '[week ending] D MMMM YYYY'
      )
    })

    test('maternity leave length label has correct value', async ({
      setupLeavePage: page
    }) => {
      const lengthLabel = await page.textContent(
        leaveSummarySelectors.maternityLeaveLength
      )
      expect(lengthLabel).toContain('27 weeks')
    })

    test('notify employers label has correct value', async ({
      setupLeavePage: page
    }) => {
      const notifyByDate = calculatedLeaveDate
        .subtract(15, 'weeks')
        .startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.notifyEmployerMaternity,
        notifyByDate,
        '[by] D MMMM YYYY'
      )
    })
  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts label has correct value', async ({
      setupLeavePage: page
    }) => {
      const startOfWeek = calculatedLeaveDate.startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.paternityLeaveStarts,
        startOfWeek,
        '[week starting] D MMMM YYYY'
      )
    })

    test('parental leave length label has correct value', async ({
      setupLeavePage: page
    }) => {
      const lengthLabel = await page.textContent(
        leaveSummarySelectors.parentalLeaveLength
      )
      expect(lengthLabel).toContain('2 weeks')
    })

    test('notify employers label has correct value', async ({
      setupLeavePage: page
    }) => {
      const notifyByDate = calculatedLeaveDate
        .subtract(15, 'weeks')
        .startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.notifyEmployerPaternity,
        notifyByDate,
        '[by] D MMMM YYYY'
      )
    })

    test('shared parental leave block 1 starts label has correct value', async ({
      setupLeavePage: page
    }) => {
      const sharedParentalStart = calculatedLeaveDate
        .add(2, 'weeks')
        .startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.sharedParentalLeaveStart,
        sharedParentalStart,
        '[week starting] D MMMM YYYY'
      )
    })

    test('shared parental leave block 1 ends label has correct value', async ({
      setupLeavePage: page
    }) => {
      const sharedParentalEnd = calculatedLeaveDate
        .add(13, 'weeks')
        .endOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.sharedParentalLeaveEnd,
        sharedParentalEnd,
        '[week ending] D MMMM YYYY'
      )
    })

    test('shared parental leave length label has correct value', async ({
      setupLeavePage: page
    }) => {
      const lengthLabel = await page.textContent(
        leaveSummarySelectors.sharedParentalLeaveLength
      )
      expect(lengthLabel).toContain('12 weeks')
    })

    test('notify employers label for shared parental leave has correct value', async ({
      setupLeavePage: page
    }) => {
      const notifyByDate = calculatedLeaveDate
        .subtract(8, 'weeks')
        .startOf('isoWeek')
      await assertDateLabel(
        page,
        leaveSummarySelectors.notifyEmployerShared,
        notifyByDate,
        '[by] D MMMM YYYY'
      )
    })
  })
})
