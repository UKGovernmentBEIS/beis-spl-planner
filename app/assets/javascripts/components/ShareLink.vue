<template>
  <span>
    <div class="govuk-form-group">
      <label class="govuk-label govuk-!-font-weight-bold" for="event-name">
        Link to your plan
        <span class="govuk-hint">
          Use this link to return to your plan or to share it with someone.
        </span>
      </label>
      <input id="save-share-link" class="govuk-input govuk-!-font-size-14" type="text" readonly :value="token">
    </div>
  </span>
</template>

<script>
  const dset = require('dset')
  const toString = require('lodash/toString')
  const ShareTokenEncoder = require('../../../lib/shareToken/shareTokenEncoder')

  module.exports = {
    props: {
      formData: Object,
      primary: Object,
      secondary: Object
    },
    computed: {
      token: function () {
        ['primary', 'secondary'].forEach(parent => {
          this.formData[parent].leave = this[parent].leaveWeeks.map(toString)
          this.formData[parent].pay = this[parent].payWeeks.map(toString)
        })
        return new ShareTokenEncoder(this.formData).encode()
      }
    }
  }
</script>