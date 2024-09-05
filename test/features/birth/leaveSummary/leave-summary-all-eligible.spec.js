const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/leaveSummary/mother-eligible-partner-eligible.js')
const calculateDate = require('../../../utils/calculateDate.js')

test.describe('Leave summary page', () => {
  test.beforeEach(async ({ setupLeavePage }) => {})

  test('should have url', async ({ setupLeavePage: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/summary`)
  })

  test('baby is due label has correct value when given a due date 3 months ago from test run date', async ({ setupLeavePage: page }) => {
    const calculatedLeaveDate = await calculateDate()
    const dueDateLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(4) > div > dd')
    expect(dueDateLabel).toContain(calculatedLeaveDate.format('D MMMM YYYY'))
  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value for Monday 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const startofweekLeaveDate = calculatedLeaveDate.startOf('isoWeek')
      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')
      expect(maternityLeaveStartsLabel).toContain(startofweekLeaveDate.format('[week starting] D MMMM YYYY'))
    })

    test('maternity leave ends label has correct value for Sunday 27 weeks after 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const seventeenWeeksLater = calculatedLeaveDate.add(26, 'weeks')
      const endofweekLeaveDate = seventeenWeeksLater.endOf('isoWeek')
      const maternityLeaveEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd')
      expect(maternityLeaveEndsLabel).toContain(endofweekLeaveDate.format('[week ending] D MMMM YYYY'))
    })

    test('maternity leave length label has correct value of 27 weeks', async ({ setupLeavePage: page }) => {
      const maternityLength = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd')
      expect(maternityLength).toContain('27 weeks')
    })

    test('notify employers label has correct value of 15 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedNotifyDate = await calculateDate()
      const fifteenWeeksLater = calculatedNotifyDate.subtract(15, 'weeks')
      const notifyByDate = fifteenWeeksLater.startOf('isoWeek')
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd')
      expect(notifyEmployerLabel).toContain(notifyByDate.format('[by] D MMMM YYYY'))
    })
  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts (week 1) label has correct value for Monday 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const startofweekleaveDate = calculatedLeaveDate.startOf('isoWeek')
      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(1) > dd')
      expect(maternityLeaveStartsLabel).toContain(startofweekleaveDate.format('[week starting] D MMMM YYYY'))
    })

    test('parental leave length label has correct value of 2 weeks', async ({ setupLeavePage: page }) => {
      const lengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(2) > dd')
      expect(lengthLabel).toContain('2 weeks')
    })

    test('notify employers label has correct value of 15 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => {
      const notifyEmployerDate = await calculateDate()
      const fifteenWeeksLater = notifyEmployerDate.subtract(15, 'weeks')
      const notifyByDate = fifteenWeeksLater.startOf('isoWeek')
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(3) > dd')
      expect(notifyEmployerLabel).toContain(notifyByDate.format('[by] D MMMM YYYY'))
    })

    test('shared parental leave block 1 starts label has correct value of 2 weeks after 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const twoWeeksAfter = calculatedLeaveDate.add(2, 'weeks')
      const sharedparentalStartsDate = twoWeeksAfter.startOf('isoWeek')
      const blockOneStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(1) > dd')
      expect(blockOneStartsLabel).toContain(sharedparentalStartsDate.format('[week starting] D MMMM YYYY'))
    })

    test('shared parental leave block 1 ends label has correct value of 12 weeks after block 1 starts', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const fourteenWeeksLater = calculatedLeaveDate.add(13, 'weeks')
      const sharedoarentEndsDate = fourteenWeeksLater.endOf('isoWeek')
      const blockOneEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(2) > dd')
      expect(blockOneEndsLabel).toContain(sharedoarentEndsDate.format('[week ending] D MMMM YYYY'))
    })

    test('shared parental leave length label has correct value of 12 weeks', async ({ setupLeavePage: page }) => {
      const sharedParentalLengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(3) > dd')
      expect(sharedParentalLengthLabel).toContain('12 weeks')
    })

    test('shared parental leave notify employers label has correct value of the Monday 8 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => {
      const calculatedLeaveDate = await calculateDate()
      const eightWeeksBefore = calculatedLeaveDate.subtract(8, 'weeks')
      const notifyByDate = eightWeeksBefore.startOf('isoWeek')
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(4) > dd')
      expect(notifyEmployerLabel).toContain(notifyByDate.format('[by] D MMMM YYYY'))
    })
  })
})
