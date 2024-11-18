async function commonSetup (
  page,
  baseURL,
  natureOfParenthoodValue,
  primaryParent,
  secondaryParent,
  additionalLeaveQuestions = false,
  additionalSetup = false
) {
  // Nature of parenthood (birth/adoption/surrogacy)
  await page.goto(`${baseURL}`)
  await page.check(`input[value='${natureOfParenthoodValue}']`, {
    force: true
  })
  await page.click('button:text("Continue")')

  // Call the additional setup steps specific to each route
  if (additionalSetup) {
    await additionalSetup(page)
  }

  // Primary Parent (Mother/Primary Adopter)
  // eligibility/mother/shared-parental-leave-and-pay
  await page
    .getByRole('group', {
      name: `Is the ${primaryParent.name} eligible for Shared Parental Leave?`
    })
    .getByLabel(primaryParent.splEligible)
    .click({ force: true })
  await page
    .getByRole('group', {
      name: `Is the ${primaryParent.name} eligible for Statutory Shared Parental Pay?`
    })
    .getByLabel(primaryParent.splPayEligible)
    .click({ force: true })
  await page.click('button:text("Continue")')

  if (
    !additionalLeaveQuestions.primaryParentLeaveEligible &&
    additionalLeaveQuestions
  ) {
    // eligibility/mother/initial-leave-and-pay
    await page
      .getByRole('group', {
        name: `Is the ${primaryParent.name} eligible for Maternity Leave?`
      })
      .getByLabel('No')
      .click({ force: true })
    await page
      .getByRole('group', {
        name: `Is the ${primaryParent.name} eligible for Statutory Maternity Pay?`
      })
      .getByLabel('No')
      .click({ force: true })
    await page.click('button:text("Continue")')

    // eligibility/mother/maternity-allowance
    await page
      .getByRole('group', {
        name: `Is the ${primaryParent.name} eligible for Maternity Allowance?`
      })
      .getByLabel(primaryParent.materinitAllowanceEligible)
      .click({ force: true })
    await page.click('button:text("Continue")')
  }

  // Secondary Parent (Partner)
  // Eligibility/partner/shared-parental-leave-and-pay
  await page
    .getByRole('group', {
      name: `Is the ${secondaryParent.name} eligible for Shared Parental Leave?`
    })
    .getByLabel(secondaryParent.splEligible)
    .click({ force: true })
  await page
    .getByRole('group', {
      name: `Is the ${secondaryParent.name} eligible for Statutory Shared Parental Pay?`
    })
    .getByLabel(secondaryParent.splPayEligible)
    .click({ force: true })
  await page.click('button:text("Continue")')

  if (
    !additionalLeaveQuestions.secondaryParentLeaveEligible &&
    additionalLeaveQuestions
  ) {
    // eligibility/partner/paternity-leave-and-pay
    await page
      .getByRole('group', {
        name: `Is the ${secondaryParent.name} eligible for Paternity Leave?`
      })
      .getByLabel('No')
      .click({ force: true })
    await page
      .getByRole('group', {
        name: `Is the ${secondaryParent.name} eligible for Statutory Paternity Pay?`
      })
      .getByLabel('No')
      .click({ force: true })
    await page.click('button:text("Continue")')
  }

  // Start date (common across routes)
  const today = new Date()
  const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
  const day = threeMonthsAgo.getDate()
  const month = threeMonthsAgo.getMonth() + 1 // Months are zero-based
  const year = threeMonthsAgo.getFullYear()

  await page.getByRole('textbox', { name: 'Day' }).fill(day.toString())
  await page.getByRole('textbox', { name: 'Month' }).fill(month.toString())
  await page.getByRole('textbox', { name: 'Year' }).fill(year.toString())

  await page.click('button:text("Continue")')

  // Skip parent salaries (common across routes)
  await page.getByRole('link', { name: 'Skip this question' }).click()
}

module.exports = { commonSetup }
