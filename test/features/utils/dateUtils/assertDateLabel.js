const { expect } = require('@playwright/test')

const assertDateLabel = async (page, selector, expectedDate, formatString) => {
  const label = await page.textContent(selector)
  expect(label).toContain(expectedDate.format(formatString))
}

module.exports = assertDateLabel
