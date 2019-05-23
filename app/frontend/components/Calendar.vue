<template>
  <table class="govuk-table">
    <colgroup>
      <col class="col-date" />
      <col class="col-leave" />
      <col class="col-pay" />
      <col class="col-leave" />
      <col class="col-pay" />
    </colgroup>
    <thead class="govuk-table__head">
      <tr class="govuk-table__row not-pay">
        <th class="govuk-table__header" scope="col"></th>
        <th class="govuk-table__header" scope="col" colspan="2">{{ primary.name | capitalise }}</th>
        <th class="govuk-table__header" scope="col" colspan="2">{{ secondary.name | capitalise }}</th>
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
        <tr :key="'first-week-' + week.id" v-if="week.number === 0" class="first-week" >
          <th></th>
          <th colspan="4">
            <div class="govuk-heading-s no-margin">
              {{ isBirth ? 'Birth week' : 'First week the child lives with you' }}
            </div>
          </th>
        </tr>
        <tr :key="week.id" class="govuk-table__row">
          <th class="govuk-table__cell date">
            {{ week.date }}
          </th>
          <template v-for="(wk, i) in [week.primary, week.secondary]">
            <template v-if="wk.disabled">
              <td :key="'parent-' + (i + 1) + '-leave'" class="govuk-table__cell disabled"></td>
              <td :key="'parent-' + (i + 1) + '-pay'" class="govuk-table__cell disabled"></td>
            </template>
            <template v-else>
              <td :key="'parent-' + (i + 1) + '-leave'" class="govuk-table__cell leave" :class="wk.leave.type">
                <div v-if="wk.leave">
                  <div class="govuk-body no-margin">
                    {{ wk.pay ? wk.pay.amount : 'Unpaid' }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ wk.leave.label }}
                  </div>
                </div>
              </td>
              <td :key="'parent-' + (i + 1) + '-pay'" class="govuk-table__cell govuk-table__cell pay" :class="wk.leave ? (wk.pay ? wk.leave.type : 'unpaid') : ''">
                <div v-if="wk.leave">
                  <div class="govuk-body no-margin">
                    {{ wk.pay ? '✔' : '✘' }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ wk.pay ? 'Paid' : 'Unpaid' }}
                  </div>
                </div>
              </td>
            </template>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script>
  const dlv = require('dlv')

  module.exports = {
    data: () => ({
      isBirth: true,
      weeks: [
        {
          id: 'week_0',
          number: 0,
          date: '01 May',
          primary: {
            disabled: false,
            leave: {
              type: 'maternity',
              label: 'Maternity leave'
            },
            pay: {
              amount: '£100.00'
            }
          },
          secondary: {
            disabled: true,
            leave: false,
            pay: false
          }
        },
        {
          id: 'week_1',
          number: 1,
          date: '08 May',
          primary: {
            leave: {
              type: 'compulsory-maternity',
              label: 'Maternity leave'
            },
            pay: false
          },
          secondary: {
            leave: {
              type: 'paternity',
              label: 'Paternity leave'
            },
            pay: {
              amount: 'Up to £148.68'
            }
          }
        }
      ]
    }),
    props: {
      primary: Object,
      secondary: Object
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/helpers/colour";

  $colour-header: govuk-colour('grey-3');
  $cell-border: 1px solid govuk-colour('grey-3');

  $cell-colours: (
    "first-week": govuk-colour('yellow'),
    "maternity": lighten(govuk-colour('blue'), 50%),
    "compulsory-maternity": lighten(govuk-colour('blue'), 25%),
    "paternity": lighten(govuk-colour('red'), 50%),
    "shared": lighten(govuk-colour('light-green'), 25%),
    "disabled": govuk-colour('grey-2'),
    "unpaid": lighten(govuk-colour('yellow'), 25%)
  );
  @each $class, $colour in $cell-colours {
    &.#{$class} {
      background-color: $colour;
    }
  }
  .no-margin {
    margin: 0;
  }
  .govuk-table {
    table-layout: fixed;
    .col-date {
      width: 10%;
    }
    .col-leave {
      width: 35%;
    }
    .col-pay {
      width: 10%;
    }
  }
  .govuk-table__head {
    background-color: $colour-header;
    .govuk-table__header {
      text-align: center;
    }
  }
  .govuk-table__body {
    user-select: none;
    .govuk-table__cell {
      border: $cell-border;
      padding: 10px 5px;
      &.date {
        font-weight: normal;
      }
      &.pay {
        text-align: center;
      }
      &.leave, &.pay {
        cursor: cell;
      }
      &.disabled, &.compulsory-maternity.leave {
        cursor: not-allowed;
      }
      &.leave:hover, &.leave:hover + .pay, &.pay:hover {
        position: relative;
        ::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
    .first-week {
      border-left: $cell-border;
      border-right: $cell-border;
      text-align: left;
      + tr > .date {
        background-color: map-get($cell-colours, 'first-week');
        border-top: none;
      }
    }
  }
</style>


