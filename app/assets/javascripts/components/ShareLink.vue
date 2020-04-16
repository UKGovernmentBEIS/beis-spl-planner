<template>
  <span>
    <div class="govuk-form-group">
      <label class="govuk-label govuk-!-font-weight-bold" for="event-name">
        Save and share your plan
        <span class="govuk-hint">
         <p>
          Copy this link to your email or messaging service to share with someone else or make changes to it in the future.
         </p>
         <p>
          Each time you update your {{ pageType }}, you will need to copy and save this link to ensure you have the latest version.
         </p>        
        </span>
      </label>
      <div class="govuk-grid-column-three-quarters govuk-!-padding-0">
        <input class="govuk-input govuk-!-font-size-14 share-link" type="text" readonly
          :ref="'share-link'"
          :value="token"
          @click="selectToken($event)"
        />
      </div>
      <div class="govuk-grid-column-one-quarter">
        <button class="govuk-button" type="button"
          @click.prevent="copyToken()"
        >
          Copy link
        </button>
      </div>
    </div>
  </span>
</template>

<script>
  const dset = require('dset')
  const toString = require('lodash/toString')
  const cloneDeep = require('lodash/cloneDeep')
  const ShareTokenEncoder = require('../../../lib/shareToken/shareTokenEncoder')

  module.exports = {
    data: () => ({
      pageType: 'plan'
    }),
    props: {
      formData: Object,
      primary: Object,
      secondary: Object
    },
    computed: {
      token: function () {
        const currentState = cloneDeep(this.formData)
        const parents = ['primary', 'secondary']
        // in the planner we need to override data[parent][pay|leave] to keep the token up to date with the current state
        // leaveWeeks and payWeeks are integer arrays but the data object expects string arrays.
        parents.forEach(parent => {
          currentState[parent].leave = this[parent].leaveWeeks.map(toString)
          currentState[parent].pay = this[parent].payWeeks.map(toString)
        })
        const token = new ShareTokenEncoder(currentState).encode(1)
        return location.protocol + '//' + location.host + location.pathname + '?s1=' + token
      }
    },
    methods: {
      selectToken: function (event) {
        event.target.select()
      },
      copyToken: function () {
        this.$refs['share-link'].select()
        const hasCopied = document.execCommand('copy')
        if (!hasCopied) {
          window.alert('Copy failed. Please try again using your browser’s controls.')
        }
      }
    }
  }
</script>