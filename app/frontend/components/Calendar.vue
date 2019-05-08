<template>
  <table class="govuk-table">
    <thead class="govuk-table__head">
      <tr class="govuk-table__row not-pay">
        <th class="govuk-table__header" scope="col"></th>
        <th class="govuk-table__header" scope="col" colspan="2">{{ primary.name }}</th>
        <th class="govuk-table__header" scope="col" colspan="2">{{ secondary.name }}</th>
      </tr>
      <tr class="govuk-table__row">
        <th class="govuk-table__header" scope="col"></th>
        <th class="govuk-table__header" scope="col">Leave</th>
        <th class="govuk-table__header" scope="col">Pay</th>
        <th class="govuk-table__header" scope="col">Leave</th>
        <th class="govuk-table__header" scope="col">Pay</th>
      </tr>
    </thead>
    <tbody class="govuk-table__body">
      <template v-for="week in weeks">
        <tr :key="week.id" class="govuk-table__row">
          <td class="govuk-table__cell">
            {{ week.date }}
          </td>
          <td class="govuk-table__cell">
            {{ yesOrNo(week.primary.leave) }}
          </td>
          <td class="govuk-table__cell">
            {{ yesOrNo(week.primary.pay) }}
          </td>
          <td class="govuk-table__cell">
            {{ yesOrNo(week.secondary.leave) }}
          </td>
          <td class="govuk-table__cell">
            {{ yesOrNo(week.secondary.pay) }}
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script>
  const dlv = require('dlv')

  module.exports = {
    props: {
      primary: Object,
      secondary: Object
    },
    computed: {
      weeks: function () {
        const weeks = []
        for (let i = -2; i <= 2; i++) {
          weeks.push({
            id: i,
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
      yesOrNo: function (condition) {
        return condition ? '✔' : '✘'
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/helpers/colour";

  $colour-header: govuk-colour('grey-3');

  .govuk-table__head {
    background-color: $colour-header;
    th {
      text-align: center;
      text-transform: capitalize;
    }
  }
  .govuk-table__body {
    td.govuk-table__cell {
      text-align: center;
    }
  }
</style>


