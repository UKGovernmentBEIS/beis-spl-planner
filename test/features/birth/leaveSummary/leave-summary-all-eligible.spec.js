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

  test('baby is due label has correct value', async ({ setupLeavePage: page }) => {
    const { day, month, year } = await calculateDate(0, -3, 0, 0) // <- Used to pass due date 3 months ago
    const babyDueDate = formatDate('', day, month, year) // <- Full string format found within appliation

    const dueDateLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(4) > div > dd')
    expect(dueDateLabel).toContain(babyDueDate)
  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value', async ({ setupLeavePage: page }) => { // <- Should be on the Monday 3 months prior to test run date
      const referenceDate = await calculateDate(0, -3, 0, 0) // <- Used to pass due date 3 months ago
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')

      const correctStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // <- Used to pass prefix and date needed to util function

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('maternity leave ends label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27 weeks after 3 months prior to test run date
      const referenceDate = await calculateDate(0, -3, 0, 27)
      const dayOfTheWeek = referenceDate.dateCalculated.getDay() % 7
      const maternityLeaveEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd')

      const correctEndDate = await formatDate('week ending', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // <- Passes the prefix of string with the date for a string
      expect(maternityLeaveEndsLabel).toContain(correctEndDate)
    })

    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27
      const maternityLength = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd')
      expect(maternityLength).toContain('27 weeks')
    })

    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      const referenceDate = await calculateDate(0, -3, 0, -15)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // <- Passes the prefix with the date for 15 weeks before due date
      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })
  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts (week 1) label has correct value', async ({ setupLeavePage: page }) => { // <- Should be on the Monday 3 months prior to test run date
      const referenceDate = await calculateDate(0, -3, 0, 0) // <- Used to pass due date 3 months ago
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(1) > dd')

      const correctStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 2
      const lengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(2) > dd')
      expect(lengthLabel).toContain('2 weeks')
    })

    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      const referenceDate = await calculateDate(0, -3, 0, -15)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(3) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // Passes the prefix with the date for 15 weeks before due date
      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })

    test('shared parental leave block 1 starts label has correct value', async ({ setupLeavePage: page }) => { // <- 2 weeks after due date
      const referenceDate = await calculateDate(0, -3, 0, 2)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc... s

      const correctBlockOneStartDate = await formatDate('week starting', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // <- Will be in format 'week starting 13 May 2024', for example
      const blockOneStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(1) > dd')
      expect(blockOneStartsLabel).toContain(correctBlockOneStartDate)
    })

    test('shared parental leave block 1 ends label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks after block 1 starts
      const referenceDate = await calculateDate(0, -3, 0, 14)
      const dayOfTheWeek = referenceDate.dateCalculated.getDay() % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...

      const correctBlockOneEndDate = await formatDate('week ending', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year)
      const blockOneEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(2) > dd')
      expect(blockOneEndsLabel).toContain(correctBlockOneEndDate)
    })

    test('shared parental leave length label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks
      const sharedParentalLengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(3) > dd')
      expect(sharedParentalLengthLabel).toContain('12 weeks')
    })

    test('shared parental leave notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- On the Monday 8 weeks before due date
      const referenceDate = await calculateDate(0, -3, 0, -8)
      const dayOfTheWeek = (referenceDate.dateCalculated.getDay() - 1) % 7

      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(4) > dd')

      const correctNotifyEmployerDate = await formatDate('by', referenceDate.day - dayOfTheWeek, referenceDate.month, referenceDate.year) // <- Will be in format 'week starting 13 May 2024', for example

      expect(notifyEmployerLabel).toContain(correctNotifyEmployerDate)
    })
  })
})
