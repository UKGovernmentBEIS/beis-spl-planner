const { test, expect } = require('@playwright/test')

test.describe('nature-of-parenthood', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(
      /Are you having a child through birth, adoption or surrogacy?/
    )
  })

  test('should allow me to check birth and continue', async ({ page }) => {
    await page.check("input[value='birth']") // <- Click on birth

    await expect(page.locator("input[value='birth']")).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', { name: 'Mother’s leave and pay' })
    ).toBeVisible()
  })

  test('should allow me to check adoption and continue', async ({ page }) => {
    await page.check("input[value='adoption']") // <- Click on adoption

    await expect(page.locator("input[value='adoption']")).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', {
        name: 'Are you adopting the child from the UK or from overseas?'
      })
    ).toBeVisible()
  })

  test('should allow me to check surrogacy and continue', async ({ page }) => {
    await page.check("input[value='surrogacy']") // <- Click on surrogacy

    await expect(page.locator("input[value='surrogacy']")).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', {
        name: 'Parental order parent’s leave and pay'
      })
    ).toBeVisible()
  })

  test('should allow me to click on feedback', async ({ page }) => {
    await page.getByRole('link', { name: 'feedback', exact: true }).click() // <- Click on 'feedback'

    await expect(page.getByText('Give Feedback')).toBeVisible() // <- Correct page is displayed
  })

  test('should display an error if click continue without selecting an option', async ({
    page
  }) => {
    await page.click('button:text("Continue")') // <- Click on continue button without selecting an option first

    await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
  })
})
