<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <Calendar :primary="primary" :secondary="secondary" :weeks="weeks" />
    </div>
    <div class="govuk-grid-column-one-third">
      <Sidebar :primary="primary" :secondary="secondary" />
    </div>
  </div>
</template>

<script>
  const Calendar = require('./Calendar.vue')
  const Sidebar = require('./Sidebar.vue')

  module.exports = {
    components: {
      Calendar,
      Sidebar
    },
    data: () => {
      return {
        primary: {
          name: 'mother',
          nonSplLeaveType: 'maternity',
          leave: [],
          pay: []
        },
        secondary: {
          name: 'partner',
          nonSplLeaveType: 'paternity',
          leave: [],
          pay: []
        },
        onClick: () => {}
      }
    },
    computed: {
      weeks: function () {
        const weeks = []
        for (let i = -2; i <= 2; i++) {
          weeks.push({
            id: 'week_' + i,
            number: i,
            date: `Week ${i}`,
            primary: {
              leave: this.primary.leave.includes(i),
              pay: this.primary.pay.includes(i)
            },
            secondary: {
              leave: this.secondary.leave.includes(i),
              pay: this.secondary.pay.includes(i)
            }
          })
        }
        return weeks
      }
    },
    methods: {
      updateWeek: function(parent, property, week, checked) {
        const weeks = this[parent][property]
        if (checked && !weeks.includes(week)) {
          weeks.push(week)
        } else if (!checked && weeks.includes(week)) {
          const index = weeks.indexOf(week)
          weeks.splice(index, 1)
        }
      }
    }
  }
</script>
