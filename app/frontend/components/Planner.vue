<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <Calendar :primary="primary" :secondary="secondary" />
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
        isBirth: true,
        primary: {
          name: 'mother',
          leaveType: 'maternity',
          leave: [],
          pay: []
        },
        secondary: {
          name: 'partner',
          leaveType: 'paternity',
          leave: [],
          pay: []
        }
      }
    },
    methods: {
      toggleWeek: function(parent, property, week, checked) {
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
