<template>
  <table ref="calendar" class="govuk-table"
    :class="{ 'dragging': isDragging, 'hide-focus': hideFocus, 'is-ie': isIexplorer, 'interactive': interactive }"
    @mouseleave="endDrag" @mouseup.left="endDrag">
      <col class="col-date" />
    <colgroup>
      <col class="col-leave" />
      <col class="col-pay" />
    </colgroup>
    <colgroup>
      <col class="col-leave" />
      <col class="col-pay" />
    </colgroup>
    <thead class="govuk-table__head">
      <tr class="govuk-table__row">
        <th class="govuk-table__header" scope="col"></th>
        <th class="govuk-table__header" scope="col" colspan="2" id="primary-name">{{ names.primary | capitalize }}</th>
        <th class="govuk-table__header" scope="col" colspan="2" id="secondary-name">{{ names.secondary | capitalize }}</th>
      </tr>
      <tr class="govuk-table__row">
        <th class="govuk-table__header" scope="col"></th>
        <th class="govuk-table__header" scope="col" id="primary-leave">Leave</th>
        <th class="govuk-table__header" scope="col" id="primary-pay">Pay</th>
        <th class="govuk-table__header" scope="col" id="secondary-leave">Leave</th>
        <th class="govuk-table__header" scope="col" id="secondary-pay">Pay</th>
      </tr>
    </thead>
    <tbody class="govuk-table__body">
      <template v-for="(week, i) in weeks">
        <tr :key="'month-header-' + week.id" v-if="i === 0 || week.day.date() <= 7" aria-hidden="true">
          <th class="govuk-table__header month" colspan="5">
            {{ week.day.format('MMMM YYYY') }}
          </th>
        </tr>
        <tr :key="'earliest-leave-week-' + week.id" v-if="i === 0" class="row-banner" aria-hidden="true">
          <th colspan="5">
            {{ primaryLeaveType | capitalize }} leave can start in this week
          </th>
        </tr>
        <tr :key="'first-week-with-child-' + week.id" v-if="week.number === 0" class="row-banner" aria-hidden="true">
          <th colspan="5">
            {{ natureOfParenthood === 'adoption' ? 'First week the child lives with you' : 'Birth week' }}
          </th>
        </tr>
        <tr :key="week.id" class="govuk-table__row" @mouseenter="onRowMouseEnter(week)">
          <th class="govuk-table__cell date" :id="`week-${i}-date`" scope="row">
            {{ week.day.format('D') }}<br class="print-hide">
            {{ week.day.format('MMM') }}
          </th>
          <template v-for="(parent, j) in ['primary', 'secondary']">
            <template v-if="week[parent].outOfPermittedRange">
              <td :key="parent + '-leave'" class="govuk-table__cell leave disabled" :headers="`${parent}-name ${parent}-leave week-${i}-date`"></td>
              <td :key="parent + '-pay'" class="govuk-table__cell pay disabled" :headers="`${parent}-name ${parent}-pay week-${i}-date`"></td>
            </template>
            <template v-else>
              <td v-if="disableCell(week, parent)" :key="parent + '-leave'" class="govuk-table__cell leave disabled" :headers="`${parent}-name ${parent}-leave week-${i}-date`">
                <div class="govuk-body no-margin">
                    Not eligible for pay
                  </div>
                  <div class="govuk-body-s no-margin">
                    Not eligible for leave
                  </div>
              </td>
              <td v-else :key="parent + '-leave'" class="govuk-table__cell leave"
                  :headers="`${parent}-name ${parent}-leave week-${i}-date`"
                  :class="[
                      week[parent].compulsory ? 'compulsory' : week[parent].leave.text,
                      {
                        'ineligible': !cellIsEligible(week, parent, 'leave') && week[parent].leave.text,
                        'disabled': hasNoEligibility(parent)
                      }
                    ]"
                  tabindex="0" :data-row="i" :data-column="2*j"
                  @keydown.tab="onCellTab($event)"
                  @keydown.up.stop.prevent="focusCell(i - 1, 2*j)"
                  @keydown.down.stop.prevent="focusCell(i + 1, 2*j)"
                  @keydown.left.stop.prevent="focusCell(i, 2*j - 1)"
                  @keydown.right.stop.prevent="focusCell(i, 2*j + 1)"
                  @keydown.space.enter.stop.prevent="onKeyboardToggleCell(parent, 'leave', week)"
                  @mousedown.left="onCellMouseDown($event, parent, 'leave', week)">
                <div v-if="week[parent].leave.text">
                  <div class="govuk-body no-margin print-hide">
                    {{ week[parent].pay.text | leaveCellPayLabel(cellIsEligible(week, parent, 'pay')) }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ week[parent].leave.text | leaveCellLeaveLabel(week[parent].compulsory, cellIsEligible(week, parent, 'leave')) | capitalize }}
                  </div>
                </div>
                <div v-else-if="week.number > leaveBoundaries[parent].firstWeek && week.number < leaveBoundaries[parent].lastWeek"
                  class="govuk-body-s work-or-other-leave">
                    Work or other leave
                </div>
              </td>
              <td v-if="disableCell(week, parent)" :key="parent + '-pay'" class="govuk-table__cell pay disabled" :headers="`${parent}-name ${parent}-pay week-${i}-date`">
                {{ week | payCellLabel(false) }}
              </td>
              <td v-else :key="parent + '-pay'" class="govuk-table__cell govuk-table__cell pay"
                  :headers="`${parent}-name ${parent}-pay week-${i}-date`"
                  :class="{
                    'unpaid': cellIsEligible(week, parent, 'pay') && week[parent].leave.text && !week[parent].pay.text,
                    'ineligible': !cellIsEligible(week, parent, 'pay')
                    }"
                  tabindex="0" :data-row="i" :data-column="2*j + 1"
                  @keydown.tab="onCellTab($event)"
                  @keydown.up.stop.prevent="focusCell(i - 1, 2*j + 1)"
                  @keydown.down.stop.prevent="focusCell(i + 1, 2*j + 1)"
                  @keydown.left.stop.prevent="focusCell(i, 2*j)"
                  @keydown.right.stop.prevent="focusCell(i, 2*j + 2)"
                  @keydown.space.enter.stop.prevent="onKeyboardToggleCell(parent, 'pay', week)"
                  @mousedown.left="onCellMouseDown($event, parent, 'pay', week)">
                <div v-if="week[parent].leave.text || hasNoEligibility(parent)">
                  <div class="govuk-body govuk-!-font-weight-bold no-margin print-hide">
                    {{ week[parent].pay.text | payCellLabel(cellIsClickable(week, parent, 'pay')) }}
                  </div>
                  <div class="govuk-body no-margin print-show">
                    {{ week[parent].pay | printPayLabel }}
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
  const isIexplorer = require('is-iexplorer')
  const { getWeekByNumber } = require('../../../lib/weekUtils')

  const LEAVE_LABELS = Object.freeze({
    'maternity': 'maternity leave',
    'adoption': 'adoption leave',
    'paternity': 'paternity leave',
    'shared': 'Shared Parental Leave'
  })

  module.exports = {
    data: () => ({
      isIexplorer: isIexplorer,
      isDragging: false,
      lastDraggedWeekNumber: null,
      lastClickedCell: null,
      onDrag: null,
      hideFocus: false
    }),
    props: {
      natureOfParenthood: String,
      typeOfAdoption: String,
      primaryLeaveType: String,
      names: Object,
      weeks: Array,
      leaveBoundaries: Object,
      updateLeaveOrPay: Function,
      interactive: Boolean,
      eligibility: Object
    },
    filters: {
      leaveCellLeaveLabel: function (type, compulsory, isEligible) {
        if (!isEligible) {
          return 'Not eligible for leave'
        }
        return compulsory ? 'compulsory leave' : LEAVE_LABELS[type]
      },
      leaveCellPayLabel: function (payText, isEligible) {
        if (isEligible) {
          return payText || 'Unpaid'
        } else {
          return 'Not eligible for pay'
        }
      },
      payCellLabel: function (payText, cellIsEligible) {
        if (cellIsEligible)  {
          return payText ? '✓' : '✗'
        } else {
          const INELIGIBLE = '\u20E0'
          return INELIGIBLE
        }
      },
      printPayLabel: function (pay) {
        let label;
        if (pay && pay[0] === '£') {
          return pay
        } else if (pay) {
          return 'Paid'
        } else {
          return 'Unpaid'
        }
      },
      created: function () {
        window.addEventListener('keydown', this.onWindowMouseDown)
      }
    },
    methods: {
      onWindowKeydown: function (event) {
        if (event.keyCode === 9 /* TAB */) {
          this.hideFocus = false
        }
      },
      updateCell: function (week, parent, property, value) {
        // Explicitly check for false to avoid problems with empty leave object.
        if (week[parent].leave.eligible === false) {
          // When not eligible for leave, clicking in leave or pay toggles both.
          this.updateLeaveOrPay(parent, 'leave', week.number, value)
          this.updateLeaveOrPay(parent, 'pay', week.number, value)
        } else {
          this.updateLeaveOrPay(parent, property, week.number, value)
        }
      },
      onCellMouseDown: function (event, parent, property, week) {
        this.hideFocus = true
        if (!this.interactive || !this.cellIsClickable(week, parent, property)) {
          return
        }
        this.isDragging = true
        this.lastClickedCell = event.currentTarget
        const value = !week[parent][property].text
        this.onDrag = function (week) {
          if (!this.cellIsClickable(week, parent, property) || this.disableCell(week, parent)) {
            return
          }
          this.updateCell(week, parent, property, value)
        }
        // Perform drag action on initial cell.
        this.onRowMouseEnter(week)
      },
      onRowMouseEnter: function (week) {
        if (this.onDrag) {
          const weeksToUpdate = this.getWeeksToUpdate(week)
          for (let week of weeksToUpdate) {
            this.onDrag(week)
          }
          this.lastDraggedWeekNumber = week.number
        }
      },
      onCellTab: function (event) {
        if (this.hideFocus) {
          this.hideFocus = false
          event.preventDefault()
          event.stopPropagation()
        }
      },
      onKeyboardToggleCell: function (parent, property, week) {
        if (this.hideFocus) {
          this.hideFocus = false
        } else if (this.interactive && this.cellIsClickable(week, parent, property)) {
          this.updateCell(week, parent, property, !week[parent][property].text)
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
        this.lastDraggedWeekNumber = null
        this.onDrag = null
        if (this.lastClickedCell) {
          this.lastClickedCell.focus()
          this.lastClickedCell = null
        }
      },
      getWeeksToUpdate: function (currentWeek) {
        if (this.lastDraggedWeekNumber === null) {
          return [currentWeek]
        }

        const currentWeekNumber = currentWeek.number
        const calendar = this
        function toWeek (number) {
          return number === currentWeekNumber ? currentWeek : getWeekByNumber(calendar.weeks, number)
        }

        // Avoid skips.
        if (this.lastDraggedWeekNumber < currentWeekNumber) {
          return _.range(this.lastDraggedWeekNumber + 1, currentWeekNumber + 1).map(toWeek)
        } else {
          return _.range(currentWeekNumber, this.lastDraggedWeekNumber).map(toWeek)
        }
      },
      cellIsEligible: function (week, parent, property) {
        return week[parent][property].eligible === undefined || week[parent][property].eligible
      },
      cellIsClickable: function (week, parent, property) {
        return !this.hasNoEligibility(parent) &&
          (this.cellIsEligible(week, parent, property) || property !== 'pay')
      },
      hasNoEligibility: function (parent) {
        return Object.values(this.eligibility[parent]).every(eligiblity => !eligiblity)
      },
      disableCell: function (week, parent) {
        return this.hasNoEligibility(parent) ||
          (parent === 'secondary' && !this.eligibility.secondary.shpp && !this.eligibility.secondary.spl && week.number > 7)
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
    -webkit-user-select: none;
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

    &.interactive {
      &.dragging {
        cursor: ns-resize;
      }
      &:not(.dragging) {
        .govuk-table__cell {
          &.leave, &.pay {
            cursor: cell;
          }
          &.disabled, &.compulsory, &.ineligible.pay {
            cursor: not-allowed;
          }
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
    .leave.#{$class} + .pay:not(.unpaid):not(.disabled) {
      background-color: $colour;
    }
  }

  .ineligible {
    background-color: map-get($cell-colours, 'disabled') !important;
      &.leave:hover:not(.disabled) {
        background-color: hoverify(map-get($cell-colours, 'disabled')) !important;
      }
  }

  @mixin cellHoverRules() {
    $empty-cell-background-colour: govuk-colour('white');
    .leave:not(.compulsory):not(.disabled), .pay:not(.disabled) {
      &:hover {
        background-color: hoverify($empty-cell-background-colour);
      }
    }
    .leave:not(.compulsory):not(.disabled):hover + .pay:not(.disabled) {
      background-color: hoverify($empty-cell-background-colour);
    }
    @each $class, $colour in $cell-colours {
      .leave:not(.compulsory):not(.disabled), .pay:not(.disabled) {
        &.#{$class}:hover {
          background-color: hoverify($colour);
        }
      }
      .leave.#{$class} {
        + .pay:not(.disabled):not(.unpaid):hover {
          background-color: hoverify($colour);
        }
        &:not(.compulsory):not(.disabled):hover + .pay:not(.disabled) {
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

  .interactive {
    &.is-ie {
      @include cellHoverRules()
    }
    @media (hover: hover) {
      @include cellHoverRules()
    }
  }
</style>
