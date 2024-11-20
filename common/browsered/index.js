import cookieManager from "../../app/assets/javascripts/cookie-manager-1.0.0.min.js";

window.GOVUKFrontend = require("../../node_modules/govuk-frontend/dist/govuk/all.bundle.js");
window.GOVUKFrontend.initAll();

cookieManager.on("UserPreferencesSaved", (preferences) => {
  console.log(preferences);

  const dataLayer = window.dataLayer || [];

  const cookiePreferencesValue =
    preferences.analytics === "on" ? true : false;

  dataLayer.push({
    event: "Cookie Preferences",
    cookiePreferences: cookiePreferencesValue,
  });
});

const config = {
  userPreferences: {
    cookieName: "cookie_preferences_set",
    cookieExpiry: 365,
  },
  cookieBanner: {
    class: "cookie-banner",
    actions: [
      {
        name: "accept",
        buttonClass: "cookie-banner-accept-button",
        confirmationClass: "cookie-banner-accept-message",
        consent: true,
      },
      {
        name: "reject",
        buttonClass: "cookie-banner-reject-button",
        confirmationClass: "cookie-banner-reject-message",
        consent: false,
      },
      {
        name: "hide",
        buttonClass: "cookie-banner-hide-button",
      },
    ],
  },
  preferencesForm: {
    class: "cookie-preferences-form",
  },
  cookieManifest: [
    {
      categoryName: "essential",
      optional: false,
      matchBy: "exact",
      cookies: ["application"],
    },
    {
      categoryName: "analytics",
      optional: true,
      cookies: ["_ga", "_ga_NJ98WRPX", "_gat", "_gid"],
    },
    {
      categoryName: "first_party",
      optional: true,
      cookies: ["cookie_preferences_set", "cookies_policy"],
    },
  ],
};

cookieManager.init(config);

require("../../app/assets/javascripts/index");
