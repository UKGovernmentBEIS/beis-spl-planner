const test = require("../../../fixtures/birth/planner/mother-not-eligible-partner-eligible");
const { assertLeaveText } = require("../../../helpers/plannerHelpers");
const checkUrl = require("../../../helpers/general");
const {
  selectLeave,
  selectLeaveRange,
} = require("../../../utils/plannerUtils/plannerSelectLeave");
const plannerSelectors = require("../../../utils/selectors/planner");
const textConstants = require("../../../utils/constants/textConstants");

test.describe("Birth > Mother Not Eligible, Partner Eligible > Planner", () => {
  test.beforeEach(async ({ setupPlannerPage }) => {});

  test("should have correct URL", async ({ setupPlannerPage: page }) => {
    await checkUrl(page, "/planner");
  });

  test("Partner can take 2 weeks paternity leave", async ({
    setupPlannerPage: page,
  }) => {
    await selectLeaveRange(page, "father", 11, 12);

    await assertLeaveText(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.partnerNoRemainingLeave,
    );
  });

  test("Father can take 2 weeks leave separated by 10 number of weeks", async ({
    setupPlannerPage: page,
  }) => {
    await selectLeaveRange(page, "mother", 13, 23);

    await selectLeave(page, "father", 11);
    await selectLeave(page, "father", 15);

    await assertLeaveText(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.partnerNoRemainingLeave,
    );
  });

  test("Partner can take up to 39 weeks of paid leave", async ({
    setupPlannerPage: page,
  }) => {
    await selectLeaveRange(page, "father", 11, 50);

    await assertLeaveText(
      page,
      plannerSelectors.remainingLeaveSidebar,
      textConstants.partnerNoRemainingLeave,
    );
  });
});
