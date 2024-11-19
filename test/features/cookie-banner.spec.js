const { test, expect } = require('@playwright/test')

test.describe('cookie-banner', () => {
  test.beforeEach(async ({ page }) => {
    const { baseURL } = page.context()._options
    await page.goto(`${baseURL}`)
  })

  test('should display text on cookie banner', async ({ page }) => {
    await expect(page.getByText('Cookies on Plan Shared Parental Leave and Pay')).toBeVisible()
  })

  test('should have analytical cookies when accept button pressed', async ({ page }) => {
    await page.click('text="Accept additional cookies"')
    const cookies = await page.context().cookies()
    const analyticalCookies = cookies.find(cookie => cookie.name === 'cm-user-preferences')
    expect(analyticalCookies.value).toBe('%7B%22analytics%22%3A%22on%22%7D')
  })

  test('should not have analytical cookies when reject button pressed', async ({ page }) => {
    await page.click('text="Reject additional cookies"')
    const cookies = await page.context().cookies()
    const analyticalCookies = cookies.find(cookie => cookie.name === 'cm-user-preferences')
    expect(analyticalCookies.value).toBe('%7B%22analytics%22%3A%22off%22%7D')
  })

  test('should go to cookies page when pressing view cookies link', async ({ page }) => {
    await page.click('text="View cookies"')
    await expect(page).toHaveTitle(/Cookies - Plan Shared Parental Leave and Pay - GOV.UK/)
  })
})
