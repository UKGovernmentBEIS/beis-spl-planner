<template>
  <div>
    <h2 class="govuk-heading-m">
      Your leave balance
    </h2>
    <p>
      You can take a total of <span v-html="formatWeeks(52)"></span> as {{ primaryLeaveType }} leave
      or shared parental leave.
    </p>
    <p>
      You’ve taken <span v-html="formatWeeks(primaryLeaveUsed)"></span> as {{ primaryLeaveType }} leave and
      <span v-html="formatWeeks(splUsed)"></span> as shared parental leave.
      You have <span v-html="formatWeeks(sharedLeaveRemaining)"></span> left.
    </p>
    <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
      v-if="sharedLeaveRemaining < 0">
      <div class="govuk-error-summary__body">
        You’ve taken too many weeks of leave. Unselect <span v-html="formatWeeks(-sharedLeaveRemaining)"></span>.
      </div>
    </div>
    <h2 class="govuk-heading-m">
      Your pay balance
    </h2>
    <p>
      You can get a total of <span v-html="formatWeeks(39)"></span> of statutory {{ primaryLeaveType }} pay or
      statutory shared parental pay.
    </p>
    <p>
      You’ve taken <span v-html="formatWeeks(payUsed)"></span> of pay.
      You have <span v-html="formatWeeks(payRemaining)"></span> of pay left.
    </p>
    <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
      v-if="payRemaining < 0">
      <div class="govuk-error-summary__body">
        You’ve taken too many weeks of pay. Uncheck <span v-html="formatWeeks(-payRemaining)"></span>.
      </div>
    </div>
    <h2 class="govuk-heading-m">
      Paternity leave
    </h2>
    <p>
      The partner has <span v-html="formatWeeks(paternityLeaveRemaining)"></span> left to take as
      paternity leave.
    </p>
  </div>
</template>

<script>
  module.exports = {
    data: () => ({
      leaveWeeks: {
        primary: { nonSpl: 0, spl: 0 },
        secondary: { nonSpl: 0, spl: 0 }
      },
      shppWeeks: 0
    }),
    props: {
      names: Object,
      weeks: Array,
      primaryLeaveType: String
    },
    computed: {
      primaryLeaveUsed: function () {
        return this.leaveWeeks.primary.nonSpl
      },
      splUsed: function () {
        return this.leaveWeeks.primary.spl + this.leaveWeeks.secondary.spl
      },
      sharedLeaveRemaining: function () {
        const leaveBalanceUsed = this.primaryLeaveUsed + this.splUsed
        return 52 - leaveBalanceUsed
      },
      payUsed: function () {
        return this.shppWeeks
      },
      payRemaining: function () {
        return 39 - this.payUsed
      },
      paternityLeaveUsed: function () {
        return this.leaveWeeks.secondary.nonSpl
      },
      paternityLeaveRemaining: function () {
        return 2 - this.paternityLeaveUsed
      }
    },
    watch: {
      weeks: {
        immediate: true,
        handler: function (val) {
          this.resetTotals()
          for (let week of val) {
            this.updateTotalsForParent('primary', week)
            this.updateTotalsForParent('secondary', week)
          }
        }
      }
    },
    methods: {
      formatWeeks: function (number) {
        number = Math.max(number, 0)
        return '<strong>' + number + '</strong> ' + (number === 1 ? 'week' : 'weeks')
      },
      resetTotals: function () {
        this.leaveWeeks = {
          primary: { nonSpl: 0, spl: 0 },
          secondary: { nonSpl: 0, spl: 0 }
        }
        this.shppWeeks = 0
      },
      updateTotalsForParent: function (parent, week) {
        if (!week[parent].leave) {
          return
        }

        const isSpl = week[parent].leave === 'shared'
        if (isSpl) {
          this.leaveWeeks[parent].spl++
        } else {
          this.leaveWeeks[parent].nonSpl++
        }

        const isPaternity = !isSpl && (parent === 'secondary')
        if (week[parent].pay.text && !isPaternity) {
          this.shppWeeks++
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/settings/colours-applied";

  .govuk-error-summary__body {
    color: $govuk-error-colour;
    font-weight: bold;
  }
</style>

