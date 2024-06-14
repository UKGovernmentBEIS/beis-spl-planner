const { expect } = require('@playwright/test')
const test = require('../../fixtures/surrogacy/select-partners-leave-and-pay')

test.describe('child live-in date page', () => {
  test.beforeEach(async ({ setupPartnersLeaveAndPay }) => {})

  test('should have url', async ({ setupPartnersLeaveAndPay: page }) => {
    await expect(page.url()).toEqual('http://localhost:3000/start-date')
  })

  test('should have title', async ({ setupPartnersLeaveAndPay: page }) => {
    await expect(
      page.getByRole('heading', { name: 'When is the baby due, or when was the baby born?' })
    ).toBeVisible()
  })

  test.describe('input boxes', () => {
    test('should display an error if input boxes are empty', async ({ setupPartnersLeaveAndPay: page }) => {
      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a valid day, month and year' })).toBeVisible()
    })

    test('should display correct page if input boxes have valid values', async ({ setupPartnersLeaveAndPay: page }) => {

      let today = new Date()

      let threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

      let day = threeMonthsAgo.getDate()
      let month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
      let year = threeMonthsAgo.getFullYear()

      await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
      await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
      await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'Earnings from work'
        })
      ).toBeVisible()
    })

    test('should display an error if a number greater than 31 is inputted into day', async ({ setupPartnersLeaveAndPay: page }) => {
      let today = new Date()

      let threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

      let month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
      let year = threeMonthsAgo.getFullYear()

      await page.getByRole('textbox', { name: 'Day' }).fill('50')
      await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
      await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a valid day' })).toBeVisible()
    })

    // test('should display an error if a number less than 1 is inputted into day', async ({ setupPartnersLeaveAndPay: page }) => {
    //   await page.getByRole("textbox", { name: "Day" }).fill("-1")
    //   await page.getByRole("textbox", { name: "Month" }).fill("1")
    //   await page.getByRole("textbox", { name: "Year" }).fill("2024")

    //   await page.click('button:text("Continue")')

    //   await page.locator('input#day[pattern]')
    // })

    test('should display an error if a future date greater than 1 year is inputted', async ({ setupPartnersLeaveAndPay: page }) => {

      let today = new Date()

      let fiveYearsFromNow = new Date(today.setFullYear(today.getFullYear() + 5))

      let year = fiveYearsFromNow.getFullYear()

      await page.getByRole('textbox', { name: 'Day' }).fill('1')
      await page.getByRole('textbox', { name: 'Month' }).fill('1')
      await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a date within one year of today' })).toBeVisible()
    })

    test('should display an error if a future date greater than 1 year and one day is inputted', async ({ setupPartnersLeaveAndPay: page }) => {

      let today = new Date()

      today.setFullYear(today.getFullYear() + 1)
      let oneYearAndOneDayFromNow = new Date(today.setDate(today.getDate() + 1))

      let day = oneYearAndOneDayFromNow.getDate()
      let month = oneYearAndOneDayFromNow.getMonth() + 1
      let year = oneYearAndOneDayFromNow.getFullYear()

      await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
      await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
      await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a date within one year of today' })).toBeVisible()
    })
  })
})
