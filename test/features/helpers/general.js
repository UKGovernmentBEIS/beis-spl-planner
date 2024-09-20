const { expect } = require('@playwright/test')

async function checkUrl (page, expectedUrl) {
  const { baseURL } = page.context()._options
  await expect(page.url()).toEqual(`${baseURL}${expectedUrl}`)
}

module.exports = checkUrl
