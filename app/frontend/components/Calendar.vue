<template>
  <table class="govuk-table" :class="{ 'dragging': isDragging }" @mouseleave="endDrag" @mouseup.left="endDrag">
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
        <th class="govuk-table__header" scope="col" colspan="2">{{ names.primary | capitalise }}</th>
        <th class="govuk-table__header" scope="col" colspan="2">{{ names.secondary | capitalise }}</th>
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
      <template v-for="(week, i) in weeks">
        <tr :key="'month-header-' + week.id" v-if="i === 0 || week.day.date() <= 7">
          <th class="govuk-table__header month" colspan="5">
            {{ week.day.format('MMMM YYYY') }}
          </th>
        </tr>
        <tr :key="'first-week-' + week.id" v-if="week.number === 0" class="first-week">
          <th></th>
          <th colspan="4">
            <div class="govuk-heading-s no-margin">
              {{ isBirth ? 'Birth week' : 'First week the child lives with you' }}
            </div>
          </th>
        </tr>
        <tr :key="week.id" class="govuk-table__row" @mouseenter="onRowMouseEnter(week.number)">
          <th class="govuk-table__cell date">
            {{ week.day.format('DD') }}<br>
            {{ week.day.format('MMM') }}
          </th>
          <template v-for="parent in ['primary', 'secondary']">
            <template v-if="week[parent].disabled">
              <td :key="parent + '-leave'" class="govuk-table__cell disabled"></td>
              <td :key="parent + '-pay'" class="govuk-table__cell disabled"></td>
            </template>
            <template v-else>
              <td :key="parent + '-leave'" class="govuk-table__cell leave"
                  :class="week[parent].compulsory ? 'compulsory' : week[parent].leave"
                  @mousedown.left="onCellMouseDown(parent, 'leave', week.number, !week[parent].leave)">
                <div v-if="week[parent].leave">
                  <div class="govuk-body no-margin">
                    {{ week[parent].pay || 'Unpaid' }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ week[parent].leave | leaveLabel(week[parent].compulsory) | capitalise }}
                  </div>
                </div>
                <div v-else>
                  <!-- Needed for hover pseudo element. -->
                </div>
              </td>
              <td :key="parent + '-pay'" class="govuk-table__cell govuk-table__cell pay"
                  :class="{ 'unpaid': week[parent].leave && !week[parent].pay }"
                  @mousedown.left="onCellMouseDown(parent, 'pay', week.number, !week[parent].pay)">
                <div v-if="week[parent].leave">
                  <div class="govuk-body govuk-!-font-weight-bold no-margin">
                    {{ week[parent].pay ? '✓' : '✗' }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ week[parent].pay ? 'Paid' : 'Unpaid' }}
                  </div>
                </div>
                <div v-else>
                  <!-- Needed for hover pseudo element. -->
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
  const _ = require('lodash')
  const dlv = require('dlv')

  const LEAVE_LABELS = Object.freeze({
    'maternity': 'maternity leave',
    'adoption': 'adoption leave',
    'paternity': 'paternity leave',
    'shared': 'shared parental leave'
  })

  module.exports = {
    data: () => ({
      isDragging: false,
      lastDraggedRow: null,
      onDrag: null
    }),
    props: {
      isBirth: Boolean,
      names: Object,
      weeks: Array,
      updateLeaveOrPay: Function
    },
    filters: {
      leaveLabel: function (type, compulsory) {
        let label = LEAVE_LABELS[type]
        if (compulsory) {
          label = 'compulsory ' + label
        }
        return label
      }
    },
    methods: {
      onCellMouseDown: function (parent, property, week, value) {
        this.isDragging = true
        this.onDrag = function (week) {
          this.updateLeaveOrPay(parent, property, week, value)
        }
        // Perfom drag action on initial cell.
        this.onRowMouseEnter(week)
      },
      onRowMouseEnter: function (week) {
        if (this.onDrag) {
          const rowsToUpdate = this.getRowsToUpdate(week)
          for (let row of rowsToUpdate) {
            this.onDrag(row)
          }
          this.lastDraggedRow = week
        }
      },
      endDrag: function () {
        this.isDragging = false
        this.lastDraggedRow = null
        this.onDrag = null
      },
      getRowsToUpdate: function (currentRow) {
        if (this.lastDraggedRow === null) {
          return [currentRow]
        }
        // Avoid skips.
         if (this.lastDraggedRow < currentRow) {
          return _.range(this.lastDraggedRow + 1, currentRow + 1)
        } else {
          return _.range(currentRow, this.lastDraggedRow)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/settings/colours-applied";

  $colour-header: govuk-colour('grey-3');
  $cell-border: 1px solid govuk-colour('grey-3');

  $cell-colours: (
    "first-week": govuk-colour('yellow'),
    "adoption": lighten(govuk-colour('blue'), 50%),
    "maternity": lighten(govuk-colour('blue'), 50%),
    "compulsory": lighten(govuk-colour('blue'), 25%),
    "paternity": lighten(govuk-colour('red'), 50%),
    "shared": lighten(govuk-colour('light-green'), 25%),
    "disabled": govuk-colour('grey-2'),
    "unpaid": lighten(govuk-colour('yellow'), 25%)
  );

  @each $class, $colour in $cell-colours {
    .#{$class} {
      background-color: $colour;
    }
    .leave.#{$class} + .pay:not(.unpaid) {
      background-color: $colour;
    }
  }

  .no-margin {
    margin: 0;
  }

  .govuk-table {
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

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
    &.dragging {
      cursor: ns-resize;
    }
    &:not(.dragging) {
      .govuk-table__cell {
        &.leave, &.pay {
          cursor: cell;
        }
        &.disabled, &.compulsory {
          cursor: not-allowed;
        }
      }
    }
  }

  .govuk-table__head {
    .govuk-table__header {
      background-color: $colour-header;
    }
  }

  .govuk-table__header, .govuk-table__cell {
    padding: 10px 5px;
  }

  .govuk-table__body {
    .govuk-table__header {
      &.month {
        background-color: $colour-header;
      }
    }
    .govuk-table__cell {
      border: $cell-border;
      &.date {
        font-weight: normal;
      }
      &.pay {
        text-align: center;
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
          background-color: rgba(0, 0, 0, 0.1);
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
