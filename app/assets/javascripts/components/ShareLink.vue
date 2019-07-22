<template>
  <span>
    <div class="govuk-form-group">
      <label class="govuk-label govuk-!-font-weight-bold" for="event-name">
        Link to your plan
        <span class="govuk-hint">
          Click this link to copy it and use it to return to your {{ pageType }} or to share it with someone.
        </span>
      </label>
      <input class="govuk-input govuk-!-font-size-14" type="text" readonly
        :value="token"
        @click="copyToClipboard($event)"
      />
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
      copyToClipboard: function (event) {
        event.target.select()
        document.execCommand('copy')
      }
    }
  }
</script>