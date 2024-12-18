const { bindAll } = require("lodash");

window.GOVUKFrontend = require("../../node_modules/govuk-frontend/dist/govuk/all.bundle.js");
window.GOVUKFrontend.initAll();

// cookie banner logic
const cookiesPolicyName = "cookies_policy";

// bind event listeners to accept, reject buttons
function bindAcceptEventListener() {
  const acceptButton = document.querySelector(".cookie-banner-accept-button");

  try {
    acceptButton.addEventListener("click", function () {
      console.log("accept button clicked");
    });
  } catch (error) {
    console.error("error binding accept event listener", error);
  }
}

function bindRejectEventListener() {
  const rejectButton = document.querySelector(".cookie-banner-reject-button");

  try {
    rejectButton.addEventListener("click", function () {
      console.log("reject button clicked");
    });
  } catch (error) {
    console.error("error binding reject event listener", error);
  }
}

function bindAllEventListeners() {
  bindAcceptEventListener();
  bindRejectEventListener();
}

// set default cookie settings
function getDefaultPolicy() {
  return {
    essential: true,
    settings: false,
    usage: false,
    campaigns: false,
  };
}

// logic to show cookie banner
// TODO: method that checks if js is enabled

// get cookie settings from cookie
// TODO: method to get all cookies
// TODO: method to check if cookie_preferences_set exists (and if so checks cookies_policy)
  // if false, show cookie banner
  // if true, hide cookie banner

// set cookie settings based on event listeners
// TODO: based on the button that is selected, updates the cookie_preferences_set and cookies_policy cookie

// TODO: create method to call setup methods, bind event listeners, and check cookie settings

// just for testing purposes
bindAllEventListeners();

require("../../app/assets/javascripts/index");
