<template>
  <div class="govuk-grid-row">
    <div class="calendar govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full-width">
      <Calendar :weeks="weeks" :names="names" :updateLeaveOrPay="updateLeaveOrPay" />
    </div>
    <div class="sidebar govuk-grid-column-one-third-from-desktop govuk-grid-column-full-width">
      <Sidebar :weeks="weeks" :names="names" :primaryLeaveType="primaryLeaveType" />
    </div>
  </div>
</template>

<script>
  const moment = require('moment')
  const Calendar = require('./Calendar.vue')
  const Sidebar = require('./Sidebar.vue')

  module.exports = {
    components: {
      Calendar,
      Sidebar
    },
    computed: {
      minimumWeek: function () {
        return this.isBirth ? -11 : -2
      },
      names: function () {
        return {
          primary: this.isBirth ? 'mother' : 'primary adopter',
          secondary: 'partner'
        }
      },
      primaryLeaveType: function () {
        return this.isBirth ? 'maternity' : 'adoption'
      },
      payRates: function () {
        return {
          primary: {
            initial: this.primary.weeklyPay ? this.formatPay(0.9 * this.primary.weeklyPay) : '90% of weekly pay',
            statutory: this.getStatutoryPay(this.primary.weeklyPay)
          },
          secondary: {
            statutory: this.getStatutoryPay(this.secondary.weeklyPay)
          }
        }
      },
      weeks: function () {
        const weeks = []
        let initialPrimaryLeaveBlock = this.getInitialLeaveBlockTracker()
        let initialSecondaryLeaveBlock = this.getInitialLeaveBlockTracker()
        for (let i = this.minimumWeek; i <= 52; i++) {
          const week = this.getBaseWeek(i)
          const weekLeaveAndPay = this.getWeekLeaveAndPay(i)

          initialPrimaryLeaveBlock.next(weekLeaveAndPay.primary.leave)
          if (weekLeaveAndPay.primary.leave) {
            week.primary.leave = !initialPrimaryLeaveBlock.ended ? this.primaryLeaveType : 'shared'
            if (weekLeaveAndPay.primary.pay) {
              const useInitialPayRate = !initialPrimaryLeaveBlock.ended && initialPrimaryLeaveBlock.length <= 6
              week.primary.pay = useInitialPayRate ? this.payRates.primary.initial : this.payRates.primary.statutory
            }
          }

          if (!week.secondary.disabled) {
            initialSecondaryLeaveBlock.next(weekLeaveAndPay.secondary.leave)
            if (weekLeaveAndPay.secondary.leave) {
              const usePaternityLeave = i < 8 && !initialSecondaryLeaveBlock.ended && initialSecondaryLeaveBlock.length <= 2
              week.secondary.leave = usePaternityLeave ? 'paternity' : 'shared'
              if (weekLeaveAndPay.secondary.pay) {
                week.secondary.pay = this.payRates.secondary.statutory
              }
            }
          }

          weeks.push(week)
        }
        return weeks
      }
    },
    methods: {
      updateWeek: function(parent, property, week, checked) {
        const weeks = this[parent][property + 'Weeks']
        if (checked && !weeks.includes(week)) {
          weeks.push(week)
        } else if (!checked && weeks.includes(week)) {
          const index = weeks.indexOf(week)
          weeks.splice(index, 1)
        }
      },
      getBaseWeek: function (i) {
        return {
          id: 'week_' + i,
          number: i,
          day: moment.utc(this.startWeek).add(i, 'weeks'),
          primary: { disabled: false, compulsory: i === 0 || i === 1, leave: undefined, pay: undefined },
          secondary: { disabled: i < 0, compulsory: false, leave: undefined, pay: undefined }
        }
      },
      getWeekLeaveAndPay: function (i) {
        const isCompulsoryPrimaryWeek = (i === 0 || i === 1)
        return {
          primary: {
            leave: this.primary.leaveWeeks.includes(i) || isCompulsoryPrimaryWeek,
            pay: this.primary.payWeeks.includes(i) || isCompulsoryPrimaryWeek
          },
          secondary: {
            leave: this.secondary.leaveWeeks.includes(i),
            pay: this.secondary.payWeeks.includes(i)
          }
        }
      },
      getInitialLeaveBlockTracker: function () {
        return {
          started: false,
          ended: false,
          length: 0,
          next: function (value) {
            this.started = this.started || value
            this.ended = this.ended || (this.started && !value)
            if (this.started && !this.ended) {
              this.length++
            }
          }
        }
      },
      getStatutoryPay: function (weeklyPay) {
        const STATUTORY_MAXIMUM = 148.68
        return weeklyPay ?
          this.formatPay(Math.min(weeklyPay * 0.9, STATUTORY_MAXIMUM)) :
          'Up to ' + this.formatPay(STATUTORY_MAXIMUM)
      },
      formatPay: function (pay) {
        const payAsFloat = parseFloat(pay)
        return isNaN(payAsFloat) ? pay : '£' + payAsFloat.toFixed(2)
      }
    }
  }
</script>

<style lang="scss">
  @import "node_modules/govuk-frontend/settings/colours-applied";

  .calendar {
    thead {
      /* Various styling to patch sticky headers. */
      $th-height: 45px;
      th {
        position: sticky;
        z-index: 1;

        height: $th-height;
        box-sizing: border-box;
        border: none;
      }
      tr:first-child th {
        top: 0;
      }
      tr:nth-child(2) th {
        top: $th-height;
      }
    }
  }

  .sidebar {
    position: sticky;
    top: 10px;
  }
</style>
