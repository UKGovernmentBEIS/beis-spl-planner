const { expect } = require("@playwright/test");
const test = require("../../../fixtures/birth/planner/mother-eligible-partner-not-eligible");
const {
  selectLeaveRange,
  checkLeaveRangeText,
} = require("../../../utils/plannerUtils/plannerSelectLeave");
const { assertLeaveText } = require("../../../helpers/plannerHelpers");
const checkUrl = require("../../../helpers/general");
const plannerSelectors = require("../../../utils/selectors/planner");
const textConstants = require("../../../utils/constants/textConstants");

test.describe("Birth > Mother Eligible, Partner Not Eligible > Planner", () => {
  test.beforeEach(async ({ setupPlannerPage }) => {});

  test("should have correct URL", async ({ setupPlannerPage: page }) => {
    await checkUrl(page, "/planner");
  });

  test.describe("Mother", () => {
    test("Mother can take up to 52 weeks leave", async ({
      setupPlannerPage: page,
    }) => {
      await selectLeaveRange(page, "mother", 13, 63);

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.motherNoRemainingLeave,
      );
    });

    test("Mother has 2 weeks of compulsory leave that cannot be unselected", async ({
      setupPlannerPage: page,
    }) => {
      await selectLeaveRange(page, "mother", 11, 12);

      await assertLeaveText(
        page,
        plannerSelectors.remainingLeaveSidebar,
        textConstants.motherDefaultRemainingLeave,
      );
    });
  });
  test.describe("Father", () => {
    test("Father cannot select any paternity leave cells", async ({
      setupPlannerPage: page,
    }) => {
      const checkLeaveRange = await checkLeaveRangeText(
        page,
        "father",
        11,
        63,
        textConstants.notEligibleText,
      );

      expect(checkLeaveRange).toBeTruthy();
    });

    test("Your Leave side information does not refer to Paternity or Partner leave", async ({
      setupPlannerPage: page,
    }) => {
      const remainingLeaveLocator = page.locator(
        plannerSelectors.remainingLeaveSidebar,
      );
      await remainingLeaveLocator.waitFor({ state: "visible", timeout: 5000 });

      const remainingLeaveText = await remainingLeaveLocator.textContent();
      const normalizedText = remainingLeaveText.trim().replace(/\s+/g, " ");

      expect(normalizedText).not.toContain("partner");
    });
  });
});
