const { expect } = require('@playwright/test')
const test = require('../../../fixtures/birth/leaveSummary/mother-eligible-partner-eligible.js')

test.describe('Leave summary page', () => {

  test.beforeEach(async ({ setupLeavePage }) => {})

  test('should have url', async ({ setupLeavePage: page }) => {
    const { baseURL } = page.context()._options
    await expect(page.url()).toEqual(`${baseURL}/summary`)
  })

  test('baby is due label has correct value', async ({ setupLeavePage: page }) => {

  })

  test.describe('Mothers Leave Dates', () => {
    test('maternity leave starts label has correct value', async ({ setupLeavePage: page }) => { // <- Should be on the Monday 3 months prior to test run date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      const day = threeMonthsAgo.getDate()
      const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = threeMonthsAgo.getFullYear()
      const dayOfTheWeek = (threeMonthsAgo.getDay() - 1) % 7 // <- 0: Sunday, 1: Monday, 2: Tuesday etc...
  
     const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')

     const correctStartDate = `week starting ${day.toString() - dayOfTheWeek} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

     console.log("correct start date: ", correctStartDate)

     expect(maternityLeaveStartsLabel).toContain(correctStartDate)
    })
  
    test('maternity leave ends label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27 weeks after 3 months prior to test run date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      const threeMonthsAgoDay = threeMonthsAgo.getDay()

      const daystoNextSunday = (7 - threeMonthsAgoDay) % 7 // Calculates the days to the next Sunday as a difference 
      const lastDayOfWeek = new Date(threeMonthsAgo)
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + daystoNextSunday)

      const twentySevenWeeksLater = new Date(lastDayOfWeek)
      twentySevenWeeksLater.setDate(lastDayOfWeek.getDate() + (26 * 7)) // Includes the week that the maternity leave was started so 26 weeks added 

      const month = twentySevenWeeksLater.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = twentySevenWeeksLater.getFullYear()
      const day = twentySevenWeeksLater.getDate()
  
      const maternityLeaveEndsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd')

      const correctEndDate = `week ending ${day.toString()} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

      expect(maternityLeaveEndsLabel).toContain(correctEndDate)
    })
  
    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27
      const maternityLength = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd')
      expect(maternityLength).toContain('27 weeks')
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
  
      const notifyEmployerLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd')

      const correctnotifyEmployerDate = `by ${day.toString()} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

      expect(notifyEmployerLabel).toContain(correctnotifyEmployerDate)
    })

  })

  test.describe('Partners Leave Dates', () => {
    test('paternity leave starts (week 1) label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 3 months prior to test run date
    
    })
  
    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 2
      
    })
  
    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      
    })

    test('shared parental leave block 1 starts label has correct value', async ({ setupLeavePage: page }) => { // <- 2 weeks after due date
      
    })

    test('shared parental leave block 1 ends label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks after block 1 starts
      
    })

    test('shared parental leave length label has correct value', async ({ setupLeavePage: page }) => { // <- 12 weeks
    })

    test('shared parental leave notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 8 weeks before block 1 starts
      
    })

  })




})