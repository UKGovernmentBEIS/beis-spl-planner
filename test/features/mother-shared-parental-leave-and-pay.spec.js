const { test, expect } = require('@playwright/test')

test.describe('mother/shared-parental-leave-and-pay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.check("input[value='birth']")
    await page.click('button:text("Continue")')
  })

  test.describe('when "birth" is selected on "nature-of-parenthood', () => {
    test('should have url', async ({ page }) => {})
    test('should have title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Mother’s leave and pay' })
      ).toBeVisible()
    })
    test('should have a link to the eligibility tool', async ({ page }) => {})

    test.describe('with the form buttons', () => {
      test('radio buttons should be clickable', async ({ page }) => {})
      test('continue button should be clickable', async ({ page }) => {})
      test('should show error message when one or both radion buttons are not selected', async ({
        page
      }) => {})
    })

    // check next page(s) when one or both of the radio buttons are "No"
  })
})
