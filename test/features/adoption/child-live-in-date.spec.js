const { expect } = require('@playwright/test')
const test = require('../../fixtures/adoption/select-partners-leave-and-pay')

test.describe('child live-in date page', () => {
  test.beforeEach(async ({ setupPartnersLeaveAndPay }) => {})

  test('should have url', async ({ setupPartnersLeaveAndPay: page }) => {
    await expect(page.url()).toEqual('http://localhost:3000/start-date')
  })

  test('should have title', async ({ setupPartnersLeaveAndPay: page }) => {
    await expect(
      page.getByRole('heading', { name: 'When will, or when did the child start to live with you?' })
    ).toBeVisible()
  })

  test.describe('input boxes', () => {
    test('should display an error if input boxes are empty', async ({ setupPartnersLeaveAndPay: page }) => {
      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a valid day, month and year' })).toBeVisible()
    })

    test('should display correct page if input boxes have valid values', async ({ setupPartnersLeaveAndPay: page }) => {
      await page.getByRole('textbox', { name: 'Day' }).fill('1')
      await page.getByRole('textbox', { name: 'Month' }).fill('1')
      await page.getByRole('textbox', { name: 'Year' }).fill('2024')

      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'Earnings from work'
        })
      ).toBeVisible()
    })

    test('should display an error if a number greater than 31 is inputted into day', async ({ setupPartnersLeaveAndPay: page }) => {
      await page.getByRole('textbox', { name: 'Day' }).fill('50')
      await page.getByRole('textbox', { name: 'Month' }).fill('1')
      await page.getByRole('textbox', { name: 'Year' }).fill('2024')

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
      await page.getByRole('textbox', { name: 'Day' }).fill('1')
      await page.getByRole('textbox', { name: 'Month' }).fill('1')
      await page.getByRole('textbox', { name: 'Year' }).fill('2097') // <- Far away enough date for the test not to fail any time soon (i.e. if put 2026, in 3 years the test will fail)

      await page.click('button:text("Continue")')

      await expect(page.getByText('There is a problem')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Enter a date within one year of today' })).toBeVisible()
    })
  })
})
