<template>
  <table ref="calendar" class="govuk-table" :class="{ 'dragging': isDragging, 'hide-focus': hideFocus, 'is-ie': isIexplorer }"
    @mouseleave="endDrag" @mouseup.left="endDrag">
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
        <tr :key="'earliest-leave-week-' + week.id" v-if="i === 0" class="row-banner">
          <th colspan="5">
            {{ primaryLeaveType | capitalise }} leave can start in this week
          </th>
        </tr>
        <tr :key="'first-week-with-child-' + week.id" v-if="week.number === 0" class="row-banner">
          <th colspan="5">
            {{ isBirth ? 'Birth week' : 'First week the child lives with you' }}
          </th>
        </tr>
        <tr :key="week.id" class="govuk-table__row" @mouseenter="onRowMouseEnter(week.number)">
          <th class="govuk-table__cell date">
            {{ week.day.format('D') }}<br>
            {{ week.day.format('MMM') }}
          </th>
          <template v-for="(parent, j) in ['primary', 'secondary']">
            <template v-if="week[parent].disabled">
              <td :key="parent + '-leave'" class="govuk-table__cell leave disabled"></td>
              <td :key="parent + '-pay'" class="govuk-table__cell pay disabled"></td>
            </template>
            <template v-else>
              <td :key="parent + '-leave'" class="govuk-table__cell leave"
                  :class="week[parent].compulsory ? 'compulsory' : week[parent].leave"
                  tabindex="0" :data-row="i" :data-column="2*j"
                  @keydown.tab="onCellTab($event)"
                  @keydown.up.stop.prevent="focusCell(i - 1, 2*j)"
                  @keydown.down.stop.prevent="focusCell(i + 1, 2*j)"
                  @keydown.left.stop.prevent="focusCell(i, 2*j - 1)"
                  @keydown.right.stop.prevent="focusCell(i, 2*j + 1)"
                  @keydown.space.enter.stop.prevent="onKeyboardToggleCell(parent, 'leave', week.number, !week[parent].leave)"
                  @mousedown.left="onCellMouseDown($event, parent, 'leave', week.number, !week[parent].leave)">
                <div v-if="week[parent].leave">
                  <div class="govuk-body no-margin">
                    {{ week[parent].pay || 'Unpaid' }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ week[parent].leave | leaveLabel(week[parent].compulsory) | capitalise }}
                  </div>
                </div>
                <div v-else-if="week.number > leaveBoundaries[parent].firstWeek && week.number < leaveBoundaries[parent].lastWeek"
                  class="govuk-body-s work-or-other-leave">
                    Work or other leave
                </div>
              </td>
              <td :key="parent + '-pay'" class="govuk-table__cell govuk-table__cell pay"
                  :class="{ 'unpaid': week[parent].leave && !week[parent].pay }"
                  tabindex="0" :data-row="i" :data-column="2*j + 1"
                  @keydown.tab="onCellTab($event)"
                  @keydown.up.stop.prevent="focusCell(i - 1, 2*j + 1)"
                  @keydown.down.stop.prevent="focusCell(i + 1, 2*j + 1)"
                  @keydown.left.stop.prevent="focusCell(i, 2*j)"
                  @keydown.right.stop.prevent="focusCell(i, 2*j + 2)"
                  @keydown.space.enter.stop.prevent="onKeyboardToggleCell(parent, 'pay', week.number, !week[parent].pay)"
                  @mousedown.left="onCellMouseDown($event, parent, 'pay', week.number, !week[parent].pay)">
                <div v-if="week[parent].leave">
                  <div class="govuk-body govuk-!-font-weight-bold no-margin">
                    {{ week[parent].pay ? '✓' : '✗' }}
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
  const _ = require('lodash')
  const dlv = require('dlv')
  const isIexplorer = require('is-iexplorer')

  const LEAVE_LABELS = Object.freeze({
    'maternity': 'maternity leave',
    'adoption': 'adoption leave',
    'paternity': 'paternity leave',
    'shared': 'shared parental leave'
  })

  module.exports = {
    data: () => ({
      isIexplorer: isIexplorer,
      isDragging: false,
      lastDraggedRow: null,
      lastClickedCell: null,
      onDrag: null,
      hideFocus: false
    }),
    props: {
      isBirth: Boolean,
      primaryLeaveType: String,
      names: Object,
      weeks: Array,
      leaveBoundaries: Object,
      updateLeaveOrPay: Function
    },
    filters: {
      leaveLabel: function (type, compulsory) {
        return compulsory ? 'compulsory leave' : LEAVE_LABELS[type]
      }
    },
    created: function () {
      window.addEventListener('keydown', this.onWindowMouseDown)
    },
    methods: {
      onWindowKeydown: function (event) {
        if (event.keyCode === 9 /* TAB */) {
          this.hideFocus = false
        }
      },
      onCellMouseDown: function (event, parent, property, week, value) {
        this.hideFocus = true
        this.isDragging = true
        this.lastClickedCell = event.currentTarget
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
      onCellTab: function (event) {
        if (this.hideFocus) {
          this.hideFocus = false
          event.preventDefault()
          event.stopPropagation()
        }
      },
      onKeyboardToggleCell: function (parent, property, week, value) {
        if (this.hideFocus) {
          this.hideFocus = false
        } else {
          this.updateLeaveOrPay(parent, property, week, value)
        }
      },
      focusCell: function (row, column) {
        if (this.hideFocus) {
          this.hideFocus = false
        } else {
          const cell = this.$refs.calendar.querySelector('[data-row="' + row + '"][data-column="' + column + '"]')
          if (cell) {
            cell.focus()
          }
        }
      },
      endDrag: function () {
        this.isDragging = false
        this.lastDraggedRow = null
        this.onDrag = null
        if (this.lastClickedCell) {
          this.lastClickedCell.focus()
          this.lastClickedCell = null
        }
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
  @import "node_modules/govuk-frontend/settings/media-queries";
  @import "node_modules/govuk-frontend/helpers/media-queries";
  @import "node_modules/govuk-frontend/settings/colours-applied";

  $header-colour: govuk-colour('grey-3');
  $cell-border: 1px solid govuk-colour('grey-3');

  $row-banner-colour: govuk-colour('yellow');

  .hide-focus .govuk-table__cell:focus {
    outline: none;
  }

  .no-margin {
    margin: 0;
  }

  .govuk-table {
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    touch-action: manipulation;

    /* Required to keep borders on sticky table headers. */
    border-collapse: separate;

    table-layout: fixed;
    .col-date {
      width: 10%;
    }
    .row-banner > th:first-child {
      padding-left: 10%;
    }
    .col-leave {
      width: 35%;
    }
    .col-pay {
      width: 10%;
    }

    @include govuk-media-query($until: tablet) {
      .col-date {
        width: 12%;
      }
      .row-banner > th:first-child {
        padding-left: 12%;
      }
      .col-leave {
        width: 28%;
      }
      .col-pay {
        width: 16%;
      }
      .govuk-table__cell {
        &.leave, &.pay {
          height: 114px;
          box-sizing: border-box;
        }
      }
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
      background-color: $header-colour;
    }
  }

  .govuk-table__header, .govuk-table__cell {
    padding: 10px 2px;
  }

  .govuk-table__body {
    .govuk-table__header {
      &.month {
        background-color: $header-colour;
      }
    }

    .govuk-table__cell {
      &.date {
        font-weight: normal;
      }
      &.pay {
        text-align: center;
      }

      /*
        Fiddling borders to work with "border-collapse: separate;" which
        is required to keep borders on sticky table headers.
      */
      &:first-child {
        border-left: $cell-border;
      }
      border-bottom: $cell-border;
      border-right: $cell-border;
    }

    .row-banner {
      background-color: $row-banner-colour;
      text-align: left;
      th, td {
        &:first-child {
          border-left: $cell-border;
        }
        &:last-child {
          border-right: $cell-border;
        }
      }
      + tr {
        .govuk-table__cell {
          border-top: $cell-border;
        }
        th, td {
          &:first-child {
            background-color: $row-banner-colour;
            border-top: none;
          }
        }
      }
    }

    .work-or-other-leave {
      color: $govuk-secondary-text-colour;
    }
  }

  /*
    Previous incaranations of this hover styling used a translucent ::after pseudo-element
    with absolute positioning, however this is unsuitable for IE11.
  */
  @function hoverify($colour) {
    @return darken($colour, 10%);
  }

  $cell-colours: (
    "adoption": lighten(govuk-colour('blue'), 50%),
    "maternity": lighten(govuk-colour('blue'), 50%),
    "paternity": lighten(govuk-colour('red'), 50%),
    "shared": lighten(govuk-colour('light-green'), 25%),
    "compulsory": lighten(govuk-colour('blue'), 25%),
    "disabled": govuk-colour('grey-2'),
    "unpaid": lighten(govuk-colour('yellow'), 25%)
  );

  @each $class, $colour in $cell-colours {
    .leave, .pay {
      &.#{$class} {
        background-color: $colour;
      }
    }
    .leave.#{$class} + .pay:not(.unpaid) {
      background-color: $colour;
    }
  }

  @mixin cellHoverRules() {
    $empty-cell-background-colour: govuk-colour('white');
    .leave, .pay {
      &:hover {
        background-color: hoverify($empty-cell-background-colour);
      }
    }
    .leave:hover + .pay {
      background-color: hoverify($empty-cell-background-colour);
    }
    @each $class, $colour in $cell-colours {
      .leave, .pay {
        &.#{$class}:hover {
          background-color: hoverify($colour);
        }
      }
      .leave.#{$class} {
        + .pay:not(.unpaid):hover {
          background-color: hoverify($colour);
        }
        &:hover + .pay {
          &.unpaid {
            background-color: hoverify(map-get($cell-colours, 'unpaid'))
          }
          &:not(.unpaid) {
            background-color: hoverify($colour);
          }
        }
      }
    }
  }

  .is-ie {
    @include cellHoverRules()
  }
  @media (hover: hover) {
    @include cellHoverRules()
  }
</style>
