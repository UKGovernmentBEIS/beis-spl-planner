<template>
  <div>
    <h2 class="govuk-heading-m">
      Leave and pay totals
    </h2>
    <p>
      Any unused {{ primaryLeaveType }} leave can be taken as shared parental leave,
      and any unused {{ primaryLeaveType }} pay can be taken as shared parental pay.
    </p>
    <dl class="govuk-summary-list">
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">
          {{ primaryLeaveType | capitalise }}
        </dt>
        <dd class="govuk-summary-list__value">
          {{ leaveWeeks.primary.nonSpl | weeks }}
        </dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">
          {{ names.primary | capitalise }}’s SPL
        </dt>
        <dd class="govuk-summary-list__value">
          {{ leaveWeeks.primary.spl | weeks }}
        </dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">
          {{ names.secondary | capitalise }}’s SPL
        </dt>
        <dd class="govuk-summary-list__value">
          {{ leaveWeeks.secondary.spl | weeks }}
        </dd>
      </div>
      <div class="govuk-summary-list__row remaining" :class="{ 'negative': remainingPrimaryLeaveOrSpl < 0 }">
        <dt class="govuk-summary-list__key">
          Remaining
        </dt>
        <dd class="govuk-summary-list__value">
          {{ remainingPrimaryLeaveOrSpl | weeks }}
        </dd>
      </div>
    </dl>
    <dl class="govuk-summary-list">
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">
          Paid weeks
        </dt>
        <dd class="govuk-summary-list__value">
          {{ shppWeeks | weeks }}
        </dd>
      </div>
      <div class="govuk-summary-list__row remaining" :class="{ 'negative': remainingPrimaryLeaveOrShpp < 0 }">
        <dt class="govuk-summary-list__key">
          Remaining
        </dt>
        <dd class="govuk-summary-list__value">
          {{ remainingPrimaryLeaveOrShpp | weeks }}
        </dd>
      </div>
    </dl>
    <p>
      Paternity leave and pay are separate entitlements.
    </p>
    <dl class="govuk-summary-list">
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">
          Paternity
        </dt>
        <dd class="govuk-summary-list__value">
          {{ leaveWeeks.secondary.nonSpl | weeks }}
        </dd>
      </div>
      <div class="govuk-summary-list__row remaining" :class="{ 'negative': remaingPaternity < 0 }">
        <dt class="govuk-summary-list__key">
          Remaining
        </dt>
        <dd class="govuk-summary-list__value">
          {{ remainingPaternity | weeks }}
        </dd>
      </div>
    </dl>
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
    filters: {
      weeks: function (number) {
        return number + ' ' + (Math.abs(number) === 1 ? 'week' : 'weeks')
      }
    },
    computed: {
      remainingPrimaryLeaveOrSpl: function () {
        return 52 - this.leaveWeeks.primary.nonSpl - this.leaveWeeks.primary.spl - this.leaveWeeks.secondary.spl
      },
      remainingPrimaryLeaveOrShpp: function () {
        return 39 - this.shppWeeks
      },
      remainingPaternity: function () {
        return 2 - this.leaveWeeks.secondary.nonSpl
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
        if (week[parent].pay && !isPaternity) {
          this.shppWeeks++
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/settings/colours-applied";
  .govuk-summary-list {
    .govuk-summary-list__key {
      width: 50%;
    }
    .remaining {
      color: $govuk-secondary-text-colour;
      &.negative {
        color: $govuk-error-colour;
      }
    }
  }
</style>

