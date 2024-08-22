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
    const {day, month, year} = await calculateDate(0, -3, 0, 0) //Used to pass due date 3 months ago 
    const babydueDate = formatDate('', day, month, year) // Full string format found within appliation

    const dueDateLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(4) > div > dd')
    expect(dueDateLabel).toContain(babydueDate)
  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value', async ({ setupLeavePage: page }) => { // <- Should be on the Monday 3 months prior to test run date
      const threeMonthsAgo = await calculateDate(0, -3, 0, 0) //Used to pass due date 3 months ago 
      const dayOfTheWeek = (threeMonthsAgo.dateCalculated.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')

      const correctStartDate = await formatDate('week starting', threeMonthsAgo.day-dayOfTheWeek, threeMonthsAgo.month, threeMonthsAgo.year)//Used to pass prefix and date needed to util function
      console.log('correct start date: ', correctStartDate)

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('maternity leave ends label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27 weeks after 3 months prior to test run date
      const threeMonthsAgo = await calculateDate(0,-3,0,0) // Used to calculate the date 3 months ago
      const dayOfTheWeek = threeMonthsAgo.dateCalculated.getDay()
      const daystoNextSunday = (7 - dayOfTheWeek) % 7 // Calculates the days to the next Sunday as a difference

      const twentySevenWeeksLater = await calculateDate(daystoNextSunday, -3, 0, 26) // Calculates the date 27 weeks before due date being 3 months prior to today 
      console.log(twentySevenWeeksLater.day.toString())
      console.log(twentySevenWeeksLater.month.toString())
      console.log(twentySevenWeeksLater.year.toString())
      const maternityLeaveEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd')

      const correctEndDate = await formatDate('week ending', twentySevenWeeksLater.day, twentySevenWeeksLater.month, twentySevenWeeksLater.year ) // Passes the prefix of string with the date for a string 
      expect(maternityLeaveEndsLabel).toContain(correctEndDate)
    })

    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27
      const maternityLength = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd')
      expect(maternityLength).toContain('27 weeks')
    })

    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      const threeMonthsAgo = await calculateDate(0, -3, 0, 0) // Calculates the date for 3 months ago 

      const daystoMonday = (threeMonthsAgo.dateCalculated.getDay() === 0 ? -6 : 1) - threeMonthsAgo.dateCalculated.getDay() // Calculates the days to the Monday of the week from any given day as a difference
      const fifteenweeksBefore = await calculateDate(daystoMonday, -3, 0, -15) // Calculates the date 15 weeks before due date and ensures it is based on the days to the Monday of the week 

      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd')

      const correctnotifyEmployerDate = await formatDate('by', fifteenweeksBefore.day, fifteenweeksBefore.month, fifteenweeksBefore.year) //Passes the prefix with the date for 15 weeks before due date 
      expect(notifyEmployerLabel).toContain(correctnotifyEmployerDate)
    })
  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts (week 1) label has correct value', async ({ setupLeavePage: page }) => { // <- Should be on the Monday 3 months prior to test run date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      const day = threeMonthsAgo.getDate()
      const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = threeMonthsAgo.getFullYear()
      const dayOfTheWeek = (threeMonthsAgo.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...

      const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(1) > dd')

      const correctStartDate = `week starting ${day.toString() - dayOfTheWeek} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

      console.log('correct start date: ', correctStartDate)

      expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })

    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 2
      const lengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(2) > dd')

      expect(lengthLabel).toContain('2 weeks')
    })

    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      const threeMonthsAgoDay = threeMonthsAgo.getDay()

      const daystoMonday = (threeMonthsAgoDay === 0 ? -6 : 1) - threeMonthsAgoDay // Calculates the days to the Monday of the week as a difference
      const startOfWeek = new Date(threeMonthsAgo)
      startOfWeek.setDate(threeMonthsAgo.getDate() + daystoMonday)

      const fifteenweeksBefore = new Date(startOfWeek)
      fifteenweeksBefore.setDate(startOfWeek.getDate() - (15 * 7)) // Includes the week that the maternity leave was started so 26 weeks added

      const month = fifteenweeksBefore.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = fifteenweeksBefore.getFullYear()
      const day = fifteenweeksBefore.getDate()

      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(11) > div:nth-child(3) > dd')

      const correctnotifyEmployerDate = `by ${day.toString()} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

      expect(notifyEmployerLabel).toContain(correctnotifyEmployerDate)
    })

    test('shared parental leave block 1 starts label has correct value', async ({ setupLeavePage: page }) => { // <- 2 weeks after due date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() + 14)

      const day = threeMonthsAgo.getDate()
      const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = threeMonthsAgo.getFullYear()
      const dayOfTheWeek = (threeMonthsAgo.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc... s

      const correctblockoneStartDate = `week starting ${day.toString() - dayOfTheWeek} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example
      console.log(`DATE GENERATED: ${day.toString()} ${month.toString()} ${year.toString()}`)
      const blockoneStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(1) > dd')
      expect(blockoneStartsLabel).toContain(correctblockoneStartDate)
    })

    test('shared parental leave block 1 ends label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks after block 1 starts
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() + 14)
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() + 84)

      const day = threeMonthsAgo.getDate()
      const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = threeMonthsAgo.getFullYear()
      const dayOfTheWeek = (threeMonthsAgo.getDay()) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc... s

      const correctblockoneEndDate = `week ending ${day.toString() - dayOfTheWeek} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example
      console.log(`DATE GENERATED: ${day.toString()} ${month.toString()} ${year.toString()}`)
      const blockoneEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(2) > dd')
      expect(blockoneEndsLabel).toContain(correctblockoneEndDate)
    })

    test('shared parental leave length label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks
      const sharedparentalLengthLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(3) > dd')
      expect(sharedparentalLengthLabel).toContain('12 weeks')
    })

    test('shared parental leave notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- On the Monday 8 weeks before due date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      const threeMonthsAgoDay = threeMonthsAgo.getDay()

      const daystoMonday = (threeMonthsAgoDay === 0 ? -6 : 1) - threeMonthsAgoDay // Calculates the days to the Monday of the week from any given day as a difference
      const startOfWeek = new Date(threeMonthsAgo)
      startOfWeek.setDate(threeMonthsAgo.getDate() + daystoMonday)

      const eightweeksBefore = new Date(startOfWeek)
      eightweeksBefore.setDate(startOfWeek.getDate() - (8 * 7))

      const month = eightweeksBefore.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = eightweeksBefore.getFullYear()
      const day = eightweeksBefore.getDate()

      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(13) > div:nth-child(4) > dd')

      const correctnotifyEmployerDate = `by ${day.toString()} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

      expect(notifyEmployerLabel).toContain(correctnotifyEmployerDate)
    })
  })
})
