const { expect } = require('@playwright/test')

async function assertLeaveText (page, selector, expectedText) {
  const remainingLeaveLocator = page.locator(selector)
  await remainingLeaveLocator.waitFor({ state: 'visible', timeout: 5000 })

  const remainingLeaveText = await remainingLeaveLocator.textContent()
  const normalizedText = remainingLeaveText.trim().replace(/\s+/g, ' ')

  expect(normalizedText).toContain(expectedText)
}

module.exports = { assertLeaveText }
