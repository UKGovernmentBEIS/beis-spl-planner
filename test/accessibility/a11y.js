const pa11y = require('pa11y')
const puppeteer = require('puppeteer')
const { expect } = require('chai')
const paths = require('app/paths.js')
const pa11yConfig = {
  includeWarnings: true,
  ignore: ['notice'],
  chromeLaunchConfig: { ignoreHTTPSErrors: true },
  hideElements: 'html > head > link:nth-child(7),' +
                'html > body > a,' +
                'html > body > header > div > div:nth-child(2) > a,' +
                'html > body > footer > div > div > div:nth-child(1) > h2,' +
                'html > body > footer > div > div > div:nth-child(2) > a,' +
                '#primary-salary-period,' +
                '#secondary-salary-period,' +
                '#primary-leave-start,' +
                '#primary-leave-end,' +
                '#shared-parental-leave-start,' +
                '#shared-parental-leave-end',
  page: undefined,
  browser: undefined
}
const pathsToIgnore = []
const errorTitles = ['Page not found', 'Service unavailable']

/* global describe before it */

describe('Accessibility checking planner', function () {
  before('start service', async () => {
    const browser = await startBrowser()
    const page = await browser.newPage()
    page.goto('http://localhost:3000/planner?s1=0!y3m!4Hxa!0!0!0!0000000Cm00000000000000000pCCp3CCCCpFCyF_Cm')
    pa11yConfig.browser = browser
    pa11yConfig.page = page
  })
  async function startBrowser () {
    const args = ['--no-sandbox', '--start-maximized', '--ignore-certificate-errors']
    const opts = {
      args,
      headless: true,
      timeout: 20000,
      ignoreHTTPSErrors: true
    }
    const browser = await puppeteer.launch(opts)
    // If browser crashes try to reconnect
    browser.on('disconnected', startBrowser)
    return browser
  }

  it('checking pages for accessiblity issues', async function () {
    this.timeout(50000)
    const errors = await checkPath(paths.getAllPaths(), [])
    expect(errors).to.eql([])
  })

  async function checkPath (pathsToCheck, errors) {
    for (const path of pathsToCheck) {
      if (pathsToIgnore.indexOf(path) === -1) {
        console.log(`Checking accessibility for [${path}]`)
        const result = await pa11y(`http://localhost:3000${path}`, pa11yConfig)
        if (result.issues.length > 0 || errorTitles.some(title => result.documentTitle.includes(title))) {
          errors.push(result)
        }
      }
    }
    return errors
  }
})
