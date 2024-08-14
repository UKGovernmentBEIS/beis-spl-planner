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
    test('maternity leave starts label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 3 months prior to test run date
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
  
      const day = threeMonthsAgo.getDate()
      const month = threeMonthsAgo.toLocaleString('default', { month: 'long' }) // <- Get full month name (e.g. "September")
      const year = threeMonthsAgo.getFullYear()
  

     const maternityLeaveStartsLabel = await page.textContent('#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd')

     const correctStartDate = `week starting ${day.toString() - 1} ${month.toString()} ${year.toString()}` // <- Will be in format 'week starting 13 May 2024', for example

     expect(maternityLeaveStartsLabel).toContain(correctStartDate)

    })
  
    test('maternity leave ends label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 52 weeks after 3 months prior to test run date
      
    })
  
    test('length label has correct value', async ({ setupLeavePage: page }) => { // <- Should be 27
      
    })
  
    test('notify employers label has correct value', async ({ setupLeavePage: page }) => { // <- 15 weeks before due date
      
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