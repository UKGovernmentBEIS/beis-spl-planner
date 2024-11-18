const { test, expect } = require('@playwright/test')

test.describe('nature-of-parenthood', () => {
  test.beforeEach(async ({ page }) => {
    const { baseURL } = page.context()._options
    await page.goto(`${baseURL}`)
  })

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(
      /Are you having a child through birth, adoption or surrogacy?/
    )
  })

  test('should allow me to check birth and continue', async ({ page }) => {
    await page.check(
      '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(1) > label'
    ) // <- Click on birth

    await expect(
      page.locator(
        '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(1) > label'
      )
    ).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', { name: 'Mother’s leave and pay' })
    ).toBeVisible()
  })

  test('should allow me to check adoption and continue', async ({ page }) => {
    await page.check(
      '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(2) > label'
    ) // <- Click on adoption

    await expect(
      page.locator(
        '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(2) > label'
      )
    ).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', {
        name: 'Are you adopting the child from the UK or from overseas?'
      })
    ).toBeVisible()
  })

  test('should allow me to check surrogacy and continue', async ({ page }) => {
    await page.check(
      '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(3) > label'
    ) // <- Click on surrogacy

    await expect(
      page.locator(
        '#main-content > div > div > form > div > fieldset > div.govuk-radios.govuk-radios > div:nth-child(3) > label'
      )
    ).toBeChecked()

    await page.click('button:text("Continue")') // <- Click on continue button

    await expect(
      page.getByRole('heading', {
        name: 'Parental order parent’s leave and pay'
      })
    ).toBeVisible()
  })

  test('should display an error if click continue without selecting an option', async ({
    page
  }) => {
    await page.click('button:text("Continue")') // <- Click on continue button without selecting an option first

    await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
  })
})
