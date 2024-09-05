const { expect } = require('@playwright/test')
const test = require('../../fixtures/birth/select-partners-leave-and-pay')
const checkUrl = require('../../helpers/general')

test.describe('child live-in date page', () => {
  test.beforeEach(async ({ setupPartnersLeaveAndPay }) => {})

  test('should have url', async ({ setupPartnersLeaveAndPay: page }) => {
    await checkUrl(page, '/start-date')
  })

  test('should have title', async ({ setupPartnersLeaveAndPay: page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'When is the baby due, or when was the baby born?'
      })
    ).toBeVisible()
  })

  test.describe('input boxes', () => {
    test('should display an error if input boxes are empty', async ({
      setupPartnersLeaveAndPay: page
    }) => {
      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Enter a valid day, month and year' })
      ).toBeVisible()
    })

    test('should display an error if a number greater than 31 is inputted into day', async ({
      setupPartnersLeaveAndPay: page
    }) => {
      const today = new Date()

      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

      const month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
      const year = threeMonthsAgo.getFullYear()

      await page.getByRole('textbox', { name: 'Day' }).fill('50')
      await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
      await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Enter a valid day' })
      ).toBeVisible()
    })

    // test('should display an error if a number less than 1 is inputted into day', async ({ setupPartnersLeaveAndPay: page }) => {
    //   await page.getByRole("textbox", { name: "Day" }).fill("-1")
    //   await page.getByRole("textbox", { name: "Month" }).fill("1")
    //   await page.getByRole("textbox", { name: "Year" }).fill("2024")

    //   await page.click('button:text("Continue")')

    //   await page.locator('input#day[pattern]')
    // })
    test.describe('when given dates in the future', () => {
      test('should not display an error if a future date less than 1 year is inputted', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        const threeMonthsFromNow = new Date(
          today.setMonth(today.getMonth() + 3)
        )

        const day = threeMonthsFromNow.getDate()
        const month = threeMonthsFromNow.getMonth() + 1 // <- Months are zero-based, so add 1
        const year = threeMonthsFromNow.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'Earnings from work'
          })
        ).toBeVisible()
      })

      test('should display an error if a future date greater than 1 year is inputted', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        const fiveYearsFromNow = new Date(
          today.setFullYear(today.getFullYear() + 5)
        )

        const day = fiveYearsFromNow.getDate()
        const month = fiveYearsFromNow.getMonth() + 1
        const year = fiveYearsFromNow.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(page.getByText('There is a problem')).toBeVisible()
        await expect(
          page.getByRole('link', {
            name: 'Enter a date within one year of today'
          })
        ).toBeVisible()
      })

      test('should display an error if the date is exactly 1 year in the future', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        today.setFullYear(today.getFullYear() + 1)
        const oneYearAndOneDayFromNow = new Date(
          today.setDate(today.getDate() + 1)
        )

        const day = oneYearAndOneDayFromNow.getDate()
        const month = oneYearAndOneDayFromNow.getMonth() + 1
        const year = oneYearAndOneDayFromNow.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(page.getByText('There is a problem')).toBeVisible()
        await expect(
          page.getByRole('link', {
            name: 'Enter a date within one year of today'
          })
        ).toBeVisible()
      })
    })

    test.describe('when given dates in the past', () => {
      test('should not display an error if a past date less than 1 year is inputted', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))

        const day = threeMonthsAgo.getDate()
        const month = threeMonthsAgo.getMonth() + 1 // <- Months are zero-based, so add 1
        const year = threeMonthsAgo.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'Earnings from work'
          })
        ).toBeVisible()
      })

      test('should display an error if a past date greater than 1 year is inputted', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        const fiveYearsAgo = new Date(
          today.setFullYear(today.getFullYear() - 5)
        )

        const day = fiveYearsAgo.getDate()
        const month = fiveYearsAgo.getMonth() + 1
        const year = fiveYearsAgo.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(page.getByText('There is a problem')).toBeVisible()
        await expect(
          page.getByRole('link', {
            name: 'Enter a date within one year of today'
          })
        ).toBeVisible()
      })

      test('should display an error if the date is exactly 1 year in the past', async ({
        setupPartnersLeaveAndPay: page
      }) => {
        const today = new Date()

        const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))

        const day = oneYearAgo.getDate()
        const month = oneYearAgo.getMonth() + 1
        const year = oneYearAgo.getFullYear()

        await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
        await page
          .getByRole('textbox', { name: 'Month' })
          .fill(month.toString())
        await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

        await page.click('button:text("Continue")')

        await expect(page.getByText('There is a problem')).toBeVisible()
        await expect(
          page.getByRole('link', {
            name: 'Enter a date within one year of today'
          })
        ).toBeVisible()
      })
    })
  })
})
