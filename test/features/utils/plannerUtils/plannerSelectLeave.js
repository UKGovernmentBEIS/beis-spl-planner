async function selectLeave (page, parent, week) {
  await page.click(
    `td[data-row="${week}"][data-column="${parent === 'mother' ? 0 : 2}"]`
  )
}

async function selectLeaveRange (page, parentType, startWeek, endWeek) {
  for (let week = startWeek; week <= endWeek; week++) {
    await selectLeave(page, parentType, week)
  }
}

module.exports = { selectLeave, selectLeaveRange }
