const { expect } = require("@playwright/test");
const test = require("../../../fixtures/birth/planner/all-eligible");
const selectLeave = require("../../../utils/plannerUtils/plannerSelectLeave");
const {
  checkUrl,
  assertRemainingLeave,
} = require("../../../helpers/plannerHelpers");
const plannerSelectors = require("../../../utils/selectors/planner");

test.describe("Birth > All Eligible > Planner", () => {
  test.beforeEach(async ({ setupPlannerPage }) => {});

  test("should have correct URL", async ({ setupPlannerPage: page }) => {
    await checkUrl(page, "/planner");
  });

  test("Mother can take up to 52 weeks leave", async ({
    setupPlannerPage: page,
  }) => {
    for (let week = 0; week < 50; week++) {
      await selectLeave(page, "mother", week);
    }

    const remainingLeave = await page.textContent(
      plannerSelectors.remainingLeaveInfoAlert
    );
    expect(remainingLeave).toBe("0");
  });

  test("Partner can take 2 weeks paternity leave", async ({
    setupPlannerPage: page,
  }) => {
    await selectLeave(page, "father", 11);
    await selectLeave(page, "father", 12);

    await assertRemainingLeave(
      page,
      plannerSelectors.remainingLeaveSidebar,
      "The partner has 0 weeks left to take as Paternity Leave and Pay."
    );
  });

  test("Father can take 2 weeks leave separated by 10 weeks", async ({
    setupPlannerPage: page,
  }) => {
    for (let week = 13; week < 23; week++) {
      await selectLeave(page, "mother", week);
    }

    await selectLeave(page, "father", 11);
    await selectLeave(page, "father", 15);

    await assertRemainingLeave(
      page,
      plannerSelectors.remainingLeaveSidebar,
      "The partner has 0 weeks left to take as Paternity Leave and Pay."
    );
  });

  test("SPL starts for both when mother takes SPL", async ({
    setupPlannerPage: page,
  }) => {
    await selectLeave(page, "mother", 13);
    await selectLeave(page, "father", 11);
    await selectLeave(page, "father", 14);

    const fathersLeave = await page.textContent(
      plannerSelectors.fathersLeaveCalendar
    );
    expect(fathersLeave).toContain("Shared Parental Leave");
  });
});
