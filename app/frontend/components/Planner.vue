<template>
  <div class="govuk-grid-row">
    <div id="calendar" class="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full-width">
      <Calendar :weeks="leaveAndPay.weeks" :leaveBoundaries="leaveAndPay.leaveBoundaries" :names="names" :updateLeaveOrPay="updateLeaveOrPay" />
    </div>
    <div id="sidebar" class="govuk-grid-column-one-third-from-desktop govuk-grid-column-full-width">
      <Sidebar :weeks="leaveAndPay.weeks" :names="names" :primaryLeaveType="primaryLeaveType" />
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
      leaveAndPay: function () {
        const weeks = []
        let primaryLeaveTracker = this.getLeaveTracker()
        let secondaryLeaveTracker = this.getLeaveTracker()
        let hasStartedPrimaryPay = false
        let hasCurtailedPrimaryPay = false
        let primarySplHasStarted = false
        for (let i = this.minimumWeek; i <= 52; i++) {
          const week = this.getBaseWeek(i)
          const weekLeaveAndPay = this.getWeekLeaveAndPay(i)
          primaryLeaveTracker.next(weekLeaveAndPay.primary.leave, i)
          if (weekLeaveAndPay.primary.leave) {
            if (!primarySplHasStarted) {
              const startSplBecauseOfBreak = primaryLeaveTracker.initialBlockEnded
              const startSplBecauseOfPayAfterCurtailment = hasCurtailedPrimaryPay && weekLeaveAndPay.primary.pay
              primarySplHasStarted = startSplBecauseOfBreak || startSplBecauseOfPayAfterCurtailment
            }
            week.primary.leave = !primarySplHasStarted ? this.primaryLeaveType : 'shared'
            if (weekLeaveAndPay.primary.pay) {
              hasStartedPrimaryPay = true
              if (primarySplHasStarted) {
                week.primary.pay = this.payRates.primary.statutory
              } else {
                const useInitialPayRate = primaryLeaveTracker.initialBlockLength <= 6
                week.primary.pay = useInitialPayRate ? this.payRates.primary.initial : this.payRates.primary.statutory
              }
            } else if (hasStartedPrimaryPay) {
              hasCurtailedPrimaryPay = true
            }
          }

          if (!week.secondary.disabled) {
            secondaryLeaveTracker.next(weekLeaveAndPay.secondary.leave, i)
            if (weekLeaveAndPay.secondary.leave) {
              const usePaternityLeave = i < 8 && !secondaryLeaveTracker.initialBlockEnded && secondaryLeaveTracker.initialBlockLength <= 2
              week.secondary.leave = usePaternityLeave ? 'paternity' : 'shared'
              if (weekLeaveAndPay.secondary.pay) {
                week.secondary.pay = this.payRates.secondary.statutory
              }
            }
          }

          weeks.push(week)
        }
        return {
          weeks,
          leaveBoundaries: {
            primary: primaryLeaveTracker.getLeaveBoundaries(),
            secondary: secondaryLeaveTracker.getLeaveBoundaries()
          }
        }
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
          primary: {
            disabled: false,
            compulsory: i === 0 || i === 1,
            leave: undefined,
            pay: undefined
          },
          secondary: {
            disabled: i < 0,
            compulsory: false,
            leave: undefined,
            pay: undefined
          }
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
      getLeaveTracker: function () {
        return {
          firstLeaveWeek: null,
          lastLeaveWeek: null,
          initialBlockStarted: false,
          initialBlockEnded: false,
          initialBlockLength: 0,
          next: function (value, weekNumber) {
            if (value) {
              this.firstLeaveWeek = this.firstLeaveWeek !== null ? this.firstLeaveWeek : weekNumber
              this.lastLeaveWeek = weekNumber
            }
            this.initialBlockStarted = this.firstLeaveWeek !== null
            this.initialBlockEnded = this.initialBlockEnded || (this.initialBlockStarted && !value)
            if (this.initialBlockStarted && !this.initialBlockEnded) {
              this.initialBlockLength++
            }
          },
          getLeaveBoundaries: function () {
            return {
              firstWeek: this.firstLeaveWeek,
              lastWeek: this.lastLeaveWeek
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

  #calendar {
    thead {
      /* Various styling to patch sticky headers. */
      $th-height: 48px;
      th {
        position: sticky;
        z-index: 1;

        height: $th-height;
        box-sizing: border-box;
      }
      tr:first-child th {
        top: 0;
      }
      tr:nth-child(2) th {
        top: $th-height;
      }
    }
  }

  #sidebar {
    position: sticky;
    top: 0;
    padding: 10px 15px;
    max-height: 100vh;
    overflow-y: auto;
  }
</style>
