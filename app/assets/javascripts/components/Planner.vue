<template>
  <div class="govuk-grid-row">
    <div id="calendar" class="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full-width">
      <Calendar :weeks="leaveAndPay.weeks" :leaveBoundaries="leaveAndPay.leaveBoundaries" :isBirth="isBirth"
        :primaryLeaveType="primaryLeaveType" :names="names" :updateLeaveOrPay="updateLeaveOrPay" :interactive="interactive" />
    </div>
    <div id="sidebar" class="govuk-grid-column-one-third-from-desktop govuk-grid-column-full-width">
      <Sidebar :weeks="leaveAndPay.weeks" :names="names" :primaryLeaveType="primaryLeaveType" />
    </div>
  </div>
</template>

<script>
  const Calendar = require('./Calendar.vue')
  const Sidebar = require('./Sidebar.vue')
  const Weeks = require('../../../lib/weeks')

  module.exports = {
    components: {
      Calendar,
      Sidebar
    },
    computed: {
      names: function () {
        return {
          primary: this.isBirth ? 'mother' : 'primary adopter',
          secondary: 'partner'
        }
      },
      primaryLeaveType: function () {
        return this.isBirth ? 'maternity' : 'adoption'
      },
      leaveAndPay: function () {
        const weeks = new Weeks({
          isBirth: this.isBirth,
          startWeek: this.startWeek,
          primary: this.primary,
          secondary: this.secondary
        })
        return weeks.leaveAndPay()
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
    }
  }
</script>

<style lang="scss">
  @import "node_modules/govuk-frontend/settings/colours-applied";

  @mixin sticky() {
    position: sticky;
    position: -o-sticky;
    position: -webkit-sticky;
    position: -moz-sticky;
    position: -ms-sticky;
  }

  #calendar {
    thead {
      /* Various styling to patch sticky headers. */
      $th-height: 48px;
      th {
        @include sticky();
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
    @include sticky();
    top: 10px;
  }
</style>
