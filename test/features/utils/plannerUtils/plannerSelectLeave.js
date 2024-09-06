const plannerSelectors = require("../selectors/planner");

// Clicks on the cell for the given week and parent
async function selectLeave(page, parent, week) {
  await page.click(plannerSelectors.cellSelector(week, parent));
}

// Clicks on a range of cells based on week and parent type
async function selectLeaveRange(page, parent, startWeek, endWeek) {
  for (let week = startWeek; week <= endWeek; week++) {
    await selectLeave(page, parent, week);
  }
}

// Checks if the text in a specific cell for a given week and parent matches the provided text
async function checkLeaveText(page, text, week, parent) {
  const cell = await page.locator(
    plannerSelectors.notEligibleCellSelector(week, parent),
  );

  const cellText = await cell.textContent();
  return cellText.trim() === text;
}

// Checks if all cells in a range have the expected text
async function checkLeaveRangeText(page, parent, startWeek, endWeek, text) {
  const weeks = Array.from(
    { length: endWeek - startWeek + 1 },
    (_, i) => startWeek + i,
  );

  const results = await Promise.all(
    weeks.map((week) => checkLeaveText(page, text, week, parent)),
  );

  return results.every((isTextMatching) => isTextMatching);
}

module.exports = {
  selectLeave,
  selectLeaveRange,
  checkLeaveText,
  checkLeaveRangeText,
};
