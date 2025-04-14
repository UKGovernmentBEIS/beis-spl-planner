<template>
  <span>
    <div class="govuk-form-group" id="share-link-form">
      <label class="govuk-label govuk-!-font-weight-bold" for="save-share-link">
        <h2 class="govuk-heading-m">Save and share your {{ pageType }}</h2>
      </label>
      <span class="govuk-hint">
        <p>
          Copy this link to your email or messaging service to share with
          someone else or make changes to it in the future.
        </p>
        <p>
          Each time you update your {{ pageType }}, you will need to copy and
          save this link to ensure you have the latest version.
        </p>
      </span>
      <div class="govuk-!-padding-0">
        <input
          id="save-share-link"
          class="govuk-input govuk-!-font-size-14 share-link"
          type="text"
          readonly
          :ref="'share-link'"
          :value="token"
          @click="selectToken($event)"
        />
      </div>
      <div>
        <button
          class="govuk-button"
          :aria-label="
            isCopied
              ? 'Copy link to save and share :copied'
              : 'Copy link to save and share'
          "
          @click.prevent="copyToken()"
          @mouseleave="onMouseLeave()"
        >
          Copy link to save and share
        </button>
        <div v-if="isCopied" role="alert" class="govuk-tag copy-button-alert">
          Copied
        </div>
      </div>
    </div>
  </span>
</template>

<script>
const { dset } = require("dset");
const toString = require("lodash/toString");
const cloneDeep = require("lodash/cloneDeep");
const ShareTokenEncoder = require("../../../lib/shareToken/shareTokenEncoder");

module.exports = {
  data: () => ({
    pageType: "plan",
    isCopied: false,
  }),
  props: {
    formData: Object,
    primary: Object,
    secondary: Object,
  },
  computed: {
    token: function () {
      const currentState = cloneDeep(this.formData);
      const parents = ["primary", "secondary"];
      // in the planner we need to override data[parent][pay|leave] to keep the token up to date with the current state
      // leaveWeeks and payWeeks are integer arrays but the data object expects string arrays.
      parents.forEach((parent) => {
        currentState[parent].leave = this[parent].leaveWeeks.map(toString);
        currentState[parent].pay = this[parent].payWeeks.map(toString);
      });
      const token = new ShareTokenEncoder(currentState).encode(1);
      return (
        location.protocol +
        "//" +
        location.host +
        location.pathname +
        "?s1=" +
        token
      );
    },
  },
  methods: {
    selectToken: function (event) {
      event.target.select();
    },
    copyToken: function () {
      this.$refs["share-link"].select();
      const hasCopied = document.execCommand("copy");
      if (!hasCopied) {
        window.alert(
          "Copy failed. Please try again using your browser’s controls."
        );
      } else {
        this.isCopied = true;
      }
    },
    onMouseLeave: function () {
      this.isCopied = false;
    },
  },
};
</script>

<style>
#share-link-form {
  margin-bottom: 0;
}
</style>
