const { test, expect } = require('@playwright/test')

test.describe('mother/shared-parental-leave-and-pay', () => {

  test.describe('when "birth" is selected on "nature-of-parenthood"', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.check("input[value='birth']")
      await page.click('button:text("Continue")')
    })

    test('should have url', async ({ page }) => {
      await expect(page.url()).toEqual('http://localhost:3000/eligibility/mother/shared-parental-leave-and-pay')
    })
    
    test('should have title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Mother’s leave and pay' })
      ).toBeVisible()
    })

    test('should have a link to the eligibility tool', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'check if you can get Shared Parental Leave or Pay' })).toBeVisible()
    })

    test.describe('with the form buttons', () => {
      test('radio buttons should be clickable', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click() // <- Click on Yes
        await expect(page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes')).toBeChecked()

        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('No').click() // <- Click on No
        await expect(page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('No')).toBeChecked()


        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click() // <- Click on Yes
        await expect(page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes')).toBeChecked()

        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click() // <- Click on No
        await expect(page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('No')).toBeChecked()

      })

      test('continue button should be clickable', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click() // <- Click on Yes
        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click() // <- Click on Yes

        await page.click('button:text("Continue")') // <- Click on continue button

        await expect(
          page.getByRole('heading', {
            name: 'Partner’s leave and pay'
          })
        ).toBeVisible()

      })

      test('should show error message when one set of radio buttons are not selected', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click() // <- Click on Yes

        await page.click('button:text("Continue")') // <- Click on continue button

        await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error

      })

      test('should show error message when both sets of radio buttons are not selected', async ({ page }) => {
        await page.click('button:text("Continue")') // <- Click on continue button

        await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Leave' })).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error

      })
    })

    // check next page(s) when one or both of the radio buttons are "No"
    test.describe('and both radio buttons are "no"', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')
      })

      test('correct page displays when next page buttons are both no', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Maternity Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Maternity Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')

        await expect(page.getByText('Is the mother eligible for Maternity Allowance?')).toBeVisible()

      })

      test('correct page displays when next page buttons are both yes', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Maternity Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Maternity Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'Partner’s leave and pay'
          })
        ).toBeVisible()

      })
    })

    test.describe('and both radio buttons are "yes"', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('group', { name: 'Is the mother eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the mother eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')
      })

      test('correct page displays when next page buttons are both no', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')

        await expect(page.getByRole('link', { name: 'check if you can get leave and pay when you have a child' })).toBeVisible()

      })

      test('correct page displays when next page buttons are both yes', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'When is the baby due, or when was the baby born?'
          })
        ).toBeVisible()

      })

      test('correct page displays when next page buttons are yes then no', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')

        await expect(page.getByText('Is the partner eligible for Statutory Paternity Pay?')).toBeVisible()

      })

      test('correct page displays when next page buttons are no then yes', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the partner eligible for Shared Parental Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the partner eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')

        await expect(page.getByText('Is the partner eligible for Paternity Leave?')).toBeVisible()

      })
    })
  })

  test.describe('when "adoption" is selected on "nature-of-parenthood"', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.check("input[value='adoption']")
      await page.click('button:text("Continue")')
    })
    
    test('should have url', async ({ page }) => {
      await expect(page.url()).toEqual('http://localhost:3000/type-of-adoption')
    })
    
    test('should have title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Are you adopting the child from the UK or from overseas?' })
      ).toBeVisible()
    })

    // test('should have a link to the eligibility tool', async ({ page }) => {
    //   await expect(page.getByRole('link', { name: 'check if you can get Shared Parental Leave or Pay' })).toBeVisible()
    // })

    test.describe('with the form buttons', () => {
      test('radio buttons should be clickable', async ({ page }) => {
        await page.check("input[value='uk']")
        await expect(page.locator("input[value='uk']")).toBeChecked()

        await page.check("input[value='overseas']")
        await expect(page.locator("input[value='overseas']")).toBeChecked()

      })

      test('continue button should be clickable', async ({ page }) => {
        await page.check("input[value='uk']")

        await page.click('button:text("Continue")') // <- Click on continue button

        await expect(
          page.getByRole('heading', {
            name: 'Primary adopter’s leave and pay'
          })
        ).toBeVisible()

      })

      test('should show error message when radio button is not selected', async ({ page }) => {
        await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

        await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select either UK or overseas adoption' })).toBeVisible() // <- Displays an error

      })
    })

    test.describe('and "UK Adoption" is selected', () => {
      test.beforeEach(async ({ page }) => {
        await page.check("input[value='uk']")
        await page.click('button:text("Continue")')
      })

      test('correct page displays', async ({ page }) => {

        await expect(page.getByText('Primary adopter’s leave and pay')).toBeVisible()
        
      })

      test('correct page displays when next page buttons are both yes', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'Partner’s leave and pay'
          })
        ).toBeVisible()

      })

      test('correct page displays when next page buttons are both no', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Shared Parental Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')

        await expect(page.getByRole('link', { name: 'check if you can get leave and pay when you have a child' })).toBeVisible()

      })

      test('correct page displays when next page buttons are yes then no', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
        await page.click('button:text("Continue")')

        await expect(page.getByText('Is the primary adopter eligible for Statutory Adoption Pay?')).toBeVisible()

      })

      test('correct page displays when next page buttons are no then yes', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Shared Parental Leave?' }).getByLabel('No').click()
        await page.getByRole('group', { name: 'Is the primary adopter eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await page.click('button:text("Continue")')

        await expect(page.getByText('Is the primary adopter eligible for Adoption Leave?')).toBeVisible()

      })
    })

  })

  test.describe('when "surrogacy" is selected on "nature-of-parenthood"', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000')
      await page.check("input[value='surrogacy']")
      await page.click('button:text("Continue")')
    })
    
    test('should have url', async ({ page }) => {
      await expect(page.url()).toEqual('http://localhost:3000/eligibility/parental-order-parent/shared-parental-leave-and-pay')
    })
    
    test('should have title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Parental order parent’s leave and pay' })
      ).toBeVisible()
    })

    test.describe('with the form buttons', () => {
      test('radio buttons should be clickable', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await expect(page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes')).toBeChecked()


        await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
        await expect(page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes')).toBeChecked()

      })

      test('continue button should be clickable', async ({ page }) => {
        await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
        await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()

        await page.click('button:text("Continue")')

        await expect(
          page.getByRole('heading', {
            name: 'Partner’s leave and pay'
          })
        ).toBeVisible()

      })

      test('should show error message when radio button is not selected', async ({ page }) => {
        await page.click('button:text("Continue")') // <- Click on continue button without selecting any radio buttons first

        await expect(page.getByText('There is a problem')).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Leave' })).toBeVisible() // <- Displays an error
        await expect(page.getByRole('link', { name: 'Select whether you are eligible for Shared Parental Pay' })).toBeVisible() // <- Displays an error

      })
    })

    test('correct page displays when next page buttons are both no', async ({ page }) => {
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await expect(
        page.getByRole('heading', {
          name: 'Parental order parent’s leave and pay'
        })
      ).toBeVisible()

    })

    test('correct page displays when next page buttons are yes then no', async ({ page }) => {
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('Yes').click()
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('No').click()
      await page.click('button:text("Continue")')

      await expect(page.getByText('Is the parental order parent eligible for Statutory Adoption Pay?')).toBeVisible()

    })

    test('correct page displays when next page buttons are no then yes', async ({ page }) => {
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Shared Parental Leave?' }).getByLabel('No').click()
      await page.getByRole('group', { name: 'Is the parental order parent eligible for Statutory Shared Parental Pay?' }).getByLabel('Yes').click()
      await page.click('button:text("Continue")')

      await expect(page.getByText('Is the parental order parent eligible for Adoption Leave?')).toBeVisible()

    })

  })
})
