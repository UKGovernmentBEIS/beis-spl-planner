<template>
  <div>
    <template v-if="hasAnyMaternityOrSharedLeaveEligibility">
      <h2 class="govuk-heading-m">
        Your leave weeks
      </h2>
      <p>
        You can split a total of <span v-html="formatWeeks(52)"></span> as {{ primaryInitialLeaveOrSharedParentalLeave }}.
      </p>
      <p>
        You’ve taken <span v-html="weeksOfPrimaryInitialLeaveAndSharedLeaveTaken"></span>.
        You have <span v-html="formatWeeks(sharedLeaveRemaining)"></span> left.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="sharedLeaveRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many leave weeks. Unselect <span v-html="formatWeeks(-sharedLeaveRemaining, 'leave')"></span>.
        </div>
      </div>
    </template>
    <template v-if="hasAnyMaternityOrSharedPayEligibility">
      <h2 class="govuk-heading-m">
        Your pay weeks
      </h2>
      <p>
        You can split a total of <span v-html="formatWeeks(39)"></span> of {{ primaryInitialPayOrSharedParentalPay }}.
      </p>
      <p>
        You’ve taken <span v-html="formatWeeks(payUsed)"></span> of pay.
        You have <span v-html="formatWeeks(payRemaining)"></span> of pay left.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="payRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many paid weeks. Untick <span v-html="formatWeeks(-payRemaining, 'paid')"></span>.
        </div>
      </div>
    </template>
    <template v-f="hasPaternityLeaveOrPayEligibility">
      <h2 class="govuk-heading-m">
        Paternity {{ paternityLeaveAndOrPay }}
      </h2>
      <p>
        The partner has <span v-html="formatWeeks(eligibility.secondary.statutoryLeave ? paternityLeaveRemaining : paternityPayRemaining)"></span> left to take as
        paternity {{ paternityLeaveAndOrPay }}.
      </p>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="paternityLeaveRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many weeks of paternity leave. Unselect <span v-html="formatWeeks(-paternityLeaveRemaining, 'paternity leave')"></span>.
        </div>
      </div>
      <div class="govuk-error-summary govuk-!-padding-2 govuk-!-margin-bottom-4" role="alert" tabindex="-1"
        v-if="!eligibility.secondary.statutoryLeave && paternityPayRemaining < 0">
        <div class="govuk-error-summary__body">
          You’ve taken too many weeks of paternity pay. Untick <span v-html="formatWeeks(-paternityPayRemaining, 'paternity pay')"></span>.
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  module.exports = {
    data: () => ({
      leaveWeeks: {
        primary: { nonSpl: 0, spl: 0 },
        secondary: { nonSpl: 0, spl: 0 }
      },
      shppAndPrimaryInitialPayWeeks: 0,
      paternityPayWeeks: 0
    }),
    props: {
      names: Object,
      weeks: Array,
      primaryLeaveType: String,
      reset: Function,
      eligibility: Object
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
        return this.shppAndPrimaryInitialPayWeeks
      },
      payRemaining: function () {
        return 39 - this.payUsed
      },
      paternityLeaveUsed: function () {
        return this.leaveWeeks.secondary.nonSpl
      },
      paternityLeaveRemaining: function () {
        return 2 - this.paternityLeaveUsed
      },
      paternityPayRemaining: function () {
        return 2 - this.paternityPayWeeks
      },
      hasAnySharedLeaveEligibility: function () {
        return this.eligibility.primary.spl || this.eligibility.secondary.spl
      },
      hasAnySharedPayEligibility: function () {
        return this.eligibility.primary.shpp || this.eligibility.secondary.shpp
      },
      hasAnyMaternityOrSharedLeaveEligibility: function () {
        return this.eligibility.primary.statutoryLeave || this.hasAnySharedLeaveEligibility
      },
      hasAnyMaternityOrSharedPayEligibility: function () {
        return this.eligibility.primary.statutoryPay || this.hasAnySharedPayEligibility
      },
      hasPaternityLeaveOrPayEligibility: function () {
        return this.eligibility.secondary.statutoryLeave || this.eligibility.secondary.statutoryPay
      },
      primaryInitialLeaveOrSharedParentalLeave: function () {
        const primaryLeave = this.eligibility.primary.statutoryLeave ?
          `${this.primaryLeaveType} leave` : undefined
        const sharedLeave = this.hasAnySharedLeaveEligibility ? `shared parental leave` : undefined
        return [primaryLeave, sharedLeave].filter(leave => leave).join(' or ')
      },
      primaryInitialPayOrSharedParentalPay: function () {
        return [`statutory ${this.primaryLeaveType} pay`, 'shared parental pay'].join(' or ')
      },
      weeksOfPrimaryInitialLeaveAndSharedLeaveTaken: function () {
        const primaryLeave = this.eligibility.primary.statutoryLeave ?
          `${this.formatWeeks(this.primaryLeaveUsed)} as ${this.primaryLeaveType} leave` :
          undefined
        const sharedLeave = this.hasAnySharedLeaveEligibility ?
          `${this.formatWeeks(this.splUsed)} as shared parental leave` :
          undefined
        return [primaryLeave, sharedLeave].filter(leave => leave).join(' and ')
      },
      paternityLeaveAndOrPay: function () {
        const leave = this.eligibility.secondary.statutoryLeave ? "leave" : undefined
        const pay = this.eligibility.secondary.statutoryPay ? "pay" : undefined
        return [leave, pay].filter(policy => policy).join(' and ')
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
      formatWeeks: function (number, weekType) {
        number = Math.max(number, 0)
        return '<strong>' + number + '</strong> ' + (weekType ? `${weekType} ` : '') + (number === 1 ? 'week' : 'weeks')
      },
      resetTotals: function () {
        this.leaveWeeks = {
          primary: { nonSpl: 0, spl: 0 },
          secondary: { nonSpl: 0, spl: 0 }
        }
        this.shppAndPrimaryInitialPayWeeks = 0
        this.paternityPayWeeks = 0
      },
      updateTotalsForParent: function (parent, week) {
        const isSpl = week[parent].leave.text === 'shared'

        if (week[parent].leave.text && week[parent].leave.eligible) {
          if (isSpl) {
            this.leaveWeeks[parent].spl++
          } else {
            this.leaveWeeks[parent].nonSpl++
          }
        }

        if (week[parent].pay.text && week[parent].pay.eligible) {
          const isPaternity = !isSpl && (parent === 'secondary')

          if (isPaternity) {
            this.paternityPayWeeks++
          } else {
            this.shppAndPrimaryInitialPayWeeks++
          }
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

