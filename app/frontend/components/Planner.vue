<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full-width">
      <Calendar :primary="primary" :secondary="secondary" :weeks="weeks" />
    </div>
    <div class="govuk-grid-column-one-third-from-desktop govuk-grid-column-full-width">
      <Sidebar :primary="primary" :secondary="secondary" />
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
        for (let i = -2; i <= 2; i++) {
          const week = this.getBaseWeek(i)
          const leaveAndPay = this.getWeekLeaveAndPay(i)

          initialPrimaryLeaveBlock.update(leaveAndPay.primary.leave)
          if (leaveAndPay.primary.leave) {
            week.primary.leave = !initialPrimaryLeaveBlock.ended ? this.primaryLeaveType : 'shared'
            if (leaveAndPay.primary.pay) {
              const useInitialPayRate = !initialPrimaryLeaveBlock.ended && initialPrimaryLeaveBlock.length <= 6
              week.primary.pay = useInitialPayRate ? this.payRates.primary.initial : this.payRates.primary.statutory
            }
          }

          if (!week.secondary.disabled) {
            initialSecondaryLeaveBlock.update(leaveAndPay.secondary.leave)
            if (leaveAndPay.secondary.leave) {
              const usePaternityLeave = i < 8 && !initialSecondaryLeaveBlock.ended && initialSecondaryLeaveBlock.length <= 2
              week.secondary.leave = usePaternityLeave ? 'paternity' : 'shared'
              if (leaveAndPay.secondary.pay) {
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
          primary: { disabled: false, compulsory: 0 <= i && i < 2, leave: undefined, pay: undefined },
          secondary: { disabled: i < 0, compulsory: false, leave: undefined, pay: undefined }
        }
      },
      getWeekLeaveAndPay: function (i) {
        return {
          primary: {
            leave: this.primary.leaveWeeks.includes(i),
            pay: this.primary.payWeeks.includes(i)
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
          update: function (current) {
            this.started = this.started || current
            this.ended = this.ended || (this.started && !current)
            if (this.started && !this.ended) {
              this.length++
            }
          }
        }
      },
      getStatutoryPay: function (weeklyPay) {
        const STATUTORY_MAXIMUM = 148.68
        return weeklyPay ? this.formatPay(Math.min(weeklyPay * 0.9, STATUTORY_MAXIMUM)) : 'Up to ' + this.formatPay(STATUTORY_MAXIMUM)
      },
      formatPay: function (pay) {
        const payAsFloat = parseFloat(pay)
        return isNaN(payAsFloat) ? pay : '£' + payAsFloat.toFixed(2)
      }
    }
  }
</script>
