const { test, expect } = require('@playwright/test')

test.describe('check head elements', () => {
  test.beforeEach(async ({ page }) => {
    const { baseURL } = page.context()._options
    await page.goto(`${baseURL}`)
  })

  test('should accept additional cookies and check head element scripts', async ({ page }) => {
    await page.click('text="Accept additional cookies"')
    await page.reload()

    const headContent = await page.evaluate(() => document.head.innerHTML)
    const scriptGoogleTagManager = headContent.includes('<script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-NJ98WRPX"></script>')
    expect(scriptGoogleTagManager).toBe(true)
  })

  test('should reject additional cookies and check head element scripts', async ({ page }) => {
    await page.click('text="Reject additional cookies"')
    await page.reload()

    const headContent = await page.evaluate(() => document.head.innerHTML)
    const scriptGoogleTagManager = headContent.includes('<script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-NJ98WRPX"></script>')
    expect(scriptGoogleTagManager).toBe(false)
  })

  test('should accept additional cookies, change preferences and check head element scripts', async ({ page }) => {
    await page.click('text="Accept additional cookies"')
    await page.reload()

    await page.click('body > footer > div > div > div.govuk-footer__meta-item.govuk-footer__meta-item--grow > ul > li:nth-child(1) > a')
    await page.check("input[value='off']")
    await expect(page.locator("input[value='off']")).toBeChecked()
    await page.click('button:text("Save")')
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForTimeout(2000)

    const headContent = await page.evaluate(() => document.head.innerHTML)
    const scriptGoogleTagManager = headContent.includes('<script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-NJ98WRPX"></script>')
    expect(scriptGoogleTagManager).toBe(false)
  })
})
