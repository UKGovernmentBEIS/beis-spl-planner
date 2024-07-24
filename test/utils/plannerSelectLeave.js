// Utility function to select a leave week for a given parent
async function selectLeave (page, parent, week) {
  await page.click(`td[data-row="${week}"][data-column="${parent === 'mother' ? 0 : 2}"]`)
}

module.exports = selectLeave
