const { test, expect } = require('@playwright/test')

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Are you having a child through birth, adoption or surrogacy?/)
})

test('should allow me to check birth and continue', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  await page.check("input[value='birth']") // <- Click on birth

  await expect(page.locator("input[value='birth']")).toBeChecked()

  await page.click('//*[@id="main-content"]/div/div/form/button') // <- Click on continue button

  await expect(page.getByRole('heading', { name: 'Mother’s leave and pay' })).toBeVisible()
})
