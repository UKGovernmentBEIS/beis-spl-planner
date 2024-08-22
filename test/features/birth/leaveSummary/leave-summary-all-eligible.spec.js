const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/leaveSummary/mother-eligible-partner-eligible.js')
const formatDate = require('../../../utils/formatDate.js')
const calculateDate = require('../../../utils/calculateDate.js')

test.describe('Leave summary page', () => {
  test.beforeEach(async ({ setupLeavePage }) => {})

  test('should have url', async ({ setupLeavePage: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/summary`)
  })

  test('baby is due label has correct value when given a due date 3 months ago from test run date', async ({ setupLeavePage: page }) => {
    const { day, month, year } = await calculateDate(0, -3, 0, 0) 
    const babyDueDate = formatDate('', day, month, year)

    const dueDateLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(4) > div > dd')
    expect(dueDateLabel).toContain(babyDueDate)
  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value for Monday 3 months before test run date', async ({ setupLeavePage: page }) => {
      const referenceDate = await calculateDate(0, -3, 0, 0) 
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7 

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')

      const correctStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('maternity leave ends label has correct value for Sunday 27 weeks after 3 months before test run date', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, 27)
      const dayOfTheWeek = referenceDate.dateCalculated.getDay() % 7
      const maternityLeaveEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd')

      const correctEndDate = await formatDate('week ending', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)
      expect(maternityLeaveEndsLabel).toContain(correctEndDate)
    })

    test('maternity leave length label has correct value of 27 weeks', async ({ setupLeavePage: page }) => { 
      const maternityLength = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd')
      expect(maternityLength).toContain('27 weeks')
    })

    test('notify employers label has correct value of 15 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => {
      const referenceDate = await calculateDate(0, -3, 0, -15)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)
      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })
  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts (week 1) label has correct value for Monday 3 months before test run date', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, 0) 
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(1) > dd')

      const correctStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('parental leave length label has correct value of 2 weeks', async ({ setupLeavePage: page }) => { 
      const lengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(2) > dd')
      expect(lengthLabel).toContain('2 weeks')
    })

    test('notify employers label has correct value of 15 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, -15)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(3) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) 
      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })

    test('shared parental leave block 1 starts label has correct value of 2 weeks after 3 months before test run date', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, 2)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7 

      const correctBlockOneStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) 
      const blockOneStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(1) > dd')
      expect(blockOneStartsLabel).toContain(correctBlockOneStartDate)
    })

    test('shared parental leave block 1 ends label has correct value of 12 weeks after block 1 starts', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, 14)
      const dayOfTheWeek = referenceDate.dateCalculated.getDay() % 7 

      const correctBlockOneEndDate = await formatDate('week ending', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)
      const blockOneEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(2) > dd')
      expect(blockOneEndsLabel).toContain(correctBlockOneEndDate)
    })

    test('shared parental leave length label has correct value of 12 weeks', async ({ setupLeavePage: page }) => {
      const sharedParentalLengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(3) > dd')
      expect(sharedParentalLengthLabel).toContain('12 weeks')
    })

    test('shared parental leave notify employers label has correct value of the Monday 8 weeks before 3 months before test run date', async ({ setupLeavePage: page }) => { 
      const referenceDate = await calculateDate(0, -3, 0, -8)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7

      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(4) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) 

      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })
  })
})
