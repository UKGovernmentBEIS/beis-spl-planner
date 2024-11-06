const { expect } = require('@playwright/test')
const test = require('./fixtures/select-cookies')
const checkUrl = require('./helpers/general')

test.describe('cookies', () => {
  test.beforeEach(async ({ setUpCookiesPage }) => {})

  test('has title', async ({ setUpCookiesPage: page }) => {
    await expect(page).toHaveTitle(
      /Cookies - Plan Shared Parental Leave and Pay - GOV.UK/
    )
  })

  test('should have url', async ({ setUpCookiesPage: page }) => {
    await checkUrl(page, '/cookies')
  })

  test('should display analytical cookies in table', async ({ setUpCookiesPage: page }) => {
    const analyticalCookiesTable = page.locator('#main-content > div > div > table:nth-child(11)')
    await expect(analyticalCookiesTable).toContainText('_ga')
    await expect(analyticalCookiesTable).toContainText('_ga_NJ98WRPX')
    await expect(analyticalCookiesTable).toContainText('_gat')
    await expect(analyticalCookiesTable).toContainText('_gat_UA-158688524-1')
    await expect(analyticalCookiesTable).toContainText('_gid')
  })

  test('should verify cookies are initially disabled', async ({ page }) => {
    await expect(page.locator("input[value='off']")).toBeChecked()
  })

  test('should enable cookies when accepted', async ({ page }) => {
    await page.check("input[value='on']")

    await expect(page.locator("input[value='on']")).toBeChecked()

    await page.click('button:text("Save")')

    const cookies = await page.context().cookies()
    const analyticalCookies = cookies.find(cookie => cookie.name === 'cm-user-preferences')
    expect(analyticalCookies.value).toBe('%7B%22analytics%22%3A%22on%22%7D')
  })

  test('should display success message after accepting cookies', async ({ page }) => {
    await page.check("input[value='on']")

    await expect(page.locator("input[value='on']")).toBeChecked()

    await page.click('button:text("Save")')

    const successMessage = page.locator('#cookie-preference-success > div')
    await expect(successMessage).toContainText('Government services may set additional cookies and, if so, will have their own cookie policy and banner.')
  })
})
