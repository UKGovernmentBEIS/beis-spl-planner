<template>
  <span>
    <div class="govuk-form-group">
      <label class="govuk-label govuk-!-font-weight-bold" for="event-name">
        Link to your plan
        <span class="govuk-hint">
          Copy this link and use it to return to your {{ pageType }} or to share it with someone.
        </span>
      </label>
      <div class="govuk-grid-column-three-quarters govuk-!-padding-0">
        <input class="govuk-input govuk-!-font-size-14 share-link" type="text" readonly
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
        parents.forEach(parent => {
          currentState[parent].leave = this[parent].leaveWeeks.map(toString)
          currentState[parent].pay = this[parent].payWeeks.map(toString)
        })
        const token = new ShareTokenEncoder(currentState).encode(1)
        return window.location.href + '?s1=' + token
      }
    },
    methods: {
      selectToken: function (event) {
        event.target.select()
      },
      copyToken: function () {
        document.querySelector('.share-link').select()
        const hasCopied = document.execCommand('copy')
        if (!hasCopied) {
          window.alert('Copy failed. Please try again using your browser’s controls.')
        }
      }
    }
  }
</script>