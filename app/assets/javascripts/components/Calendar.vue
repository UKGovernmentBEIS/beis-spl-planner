<template>
  <table ref="calendar" class="govuk-table"
    :class="{ 'dragging': isDragging, 'hide-focus': hideFocus, 'is-ie': isIexplorer, 'interactive': interactive }"
    @mouseleave="endDrag" @mouseup.left="endDrag">
    <caption class="govuk-table__caption govuk-heading-l">Leave and pay planner</caption>
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
        <th class="govuk-table__header" id="info-alert" ref="infoAlert"  style="{ height: 100% }" colspan="5">
          <div id="messages">
            <div>&ensp;<span v-html="formatWeeks(sharedLeaveRemaining, 'leave')"></span> left</div>
            <div>&ensp;<span v-html="formatWeeks(payRemaining, 'pay')"></span> left</div>
            <div class="govuk-error-summary govuk-!-padding-2" role="alert" tabindex="-1" v-if="sharedLeaveRemaining < 0 || payRemaining < 0">
              <div class="govuk-error-summary__body">
                <div v-if="sharedLeaveRemaining < 0" >
                  You’ve taken too many leave weeks.
                  Unselect <span v-html="formatWeeks(-sharedLeaveRemaining, 'leave')"></span>.
                </div>
                <div v-if="payRemaining < 0">
                  You’ve taken too many pay weeks.
                  Untick <span v-html="formatWeeks(-payRemaining, 'pay')"></span> .
                </div>
              </div>
            </div>          </div>
        </th>
      </tr>
      <tr class="govuk-table__row">
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 'px' }" id="empty-header-1"></th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 'px'  }" colspan="2" id="primary-name">{{ names.primary | capitalize }}</th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 'px' }" colspan="2" id="secondary-name">{{ names.secondary | capitalize }}</th>
      </tr>
      <tr class="govuk-table__row">
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 48 + 'px'}" id="empty-header-2"></th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 48 + 'px'}" id="primary-leave">Leave</th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 48 + 'px'}" id="primary-pay">Pay</th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 48 + 'px'}" id="secondary-leave">Leave</th>
        <th class="govuk-table__header"  v-bind:style="{ top:  headerOffset + 48 + 'px'}" id="secondary-pay">Pay</th>
      </tr>
    </thead>
    <tbody class="govuk-table__body">
      <template v-for="(week, i) in weeks">
        <tr :key="'month-header-' + week.id" v-if="i === 0 || week.day.date() <= 7" aria-hidden="true">
          <th class="govuk-table__header month" colspan="5" id="month-header">
            {{ week.day.format('MMMM YYYY') }}
          </th>
        </tr>
        <tr :key="'earliest-leave-week-' + week.id" v-if="(i === 0) && (week.number !== 0)" class="row-banner" aria-hidden="true">
          <th colspan="5" id="earliest-leave-week-header">
            {{ primaryLeaveType | capitalize }} {{ printEligibilityTypeLabel() }} can start in this week
          </th>
        </tr>
        <tr :key="'first-week-with-child-' + week.id" v-if="week.number === 0" class="row-banner" aria-hidden="true">
          <th colspan="5" v-if="natureOfParenthood !== 'adoption'" id="first-week-with-child-header">
            Birth week
          </th>
          <th colspan="5" v-else-if="typeOfAdoption === 'uk'" id="first-week-with-child-header">
            First week the child lives with you
          </th>
          <th colspan="5" v-else id="first-week-with-child-header">
            Week the child arrives in the UK
          </th>
        </tr>
        <tr :key="week.id" class="govuk-table__row" @mouseenter="onRowMouseEnter(week)">
          <th class="govuk-table__cell date" :id="`week-${i}-date`">
            {{ week.day.format('D') }}<br class="print-hide">
            {{ week.day.format('MMM') }}
          </th>
          <template v-for="(parent, j) in ['primary', 'secondary']">
            <template v-if="week[parent].outOfPermittedRange">
              <td :key="parent + '-leave'" class="govuk-table__cell leave disabled" :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-leave week-${i}-date`"></td>
              <td :key="parent + '-pay'" class="govuk-table__cell pay disabled" :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-pay week-${i}-date`"></td>
            </template>
            <template v-else>
              <td v-if="isDisabledCell(week, parent)" :key="parent + '-leave'" class="govuk-table__cell leave disabled" :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-leave week-${i}-date`">
                <div class="govuk-body-s no-margin">
                  Not eligible for leave or pay
                </div>
              </td>
              <td v-else :key="parent + '-leave'" class="govuk-table__cell leave"
                  :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-leave week-${i}-date`"
                  :class="[
                      week[parent].compulsory ? 'compulsory' : week[parent].leave.text,
                      { 'disabled': hasNoEligibility(parent) }
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
                    {{ leaveCellPayLabel(week, parent) }}
                  </div>
                  <div class="govuk-body-s no-margin">
                    {{ leaveCellLeaveLabel(week, parent) }}
                  </div>
                </div>
                <div v-else-if="week.number > leaveBoundaries[parent].firstWeek && week.number < leaveBoundaries[parent].lastWeek"
                  class="govuk-body-s work-or-other-leave">
                    Work or other leave
                </div>
              </td>
              <td v-if="isDisabledCell(week, parent)" :key="parent + '-pay'" class="govuk-table__cell pay disabled" :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-pay week-${i}-date`">
                {{ week | payCellLabel(false) }}
              </td>
              <td v-else :key="parent + '-pay'" class="govuk-table__cell govuk-table__cell pay"
                  :headers="`info-alert month-header earliest-leave-week-header first-week-with-child-header ${parent}-name ${parent}-pay week-${i}-date`"
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
    'maternity': 'Maternity',
    'adoption': 'Adoption',
    'paternity': 'Paternity',
    'shared': 'Shared Parental'
  })

  module.exports = {
    data: () => ({
      isIexplorer: isIexplorer,
      isDragging: false,
      lastDraggedWeekNumber: null,
      lastClickedCell: null,
      onDrag: null,
      hideFocus: false,
      leaveWeeks: {
        primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
        secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
      },
      shppAndPrimaryInitialPayWeeks: 0,
      paternityPayWeeks: 0,
      headerOffset: 0
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
    created: function () {
      window.addEventListener('keydown', this.onWindowMouseDown)
      window.addEventListener('resize', this.setHeaderOffset)
    },
    mounted: function () {
      this.setHeaderOffset()
    },
    updated: function() {
      this.setHeaderOffset()
    },
    beforeDestroy: function () {
      window.removeEventListener('resize', this.setHeaderOffset)
    },
    filters: {
      payCellLabel: function (payText, cellIsEligible) {
        if (cellIsEligible)  {
          return payText ? '✓' : '✗'
        } else {
          const INELIGIBLE = '\u20E0'
          return INELIGIBLE
        }
      },
      printPayLabel: function (pay) {
        if (pay && pay[0] === '£') {
          return pay
        } else if (pay) {
          return 'Paid'
        } else {
          return 'Unpaid'
        }
      }
    },
    methods: {
      leaveCellLeaveLabel: function (week, parent) {
        if (week[parent].compulsory) {
          return 'Compulsory Leave'
        }
        const type = week[parent].leave.text
        const label = LEAVE_LABELS[type]
        if (this.cellIsEligible(week, parent, 'leave')) {
          return label + ' Leave'
        } else if (type === 'maternity' && !this.eligibility.primary.statutoryPay && this.eligibility.primary.maternityAllowance) {
          return 'Maternity Allowance'
        } else {
          return label + ' Pay'
        }
      },
      leaveCellPayLabel: function (week, parent) {
        if (!this.cellIsEligible(week, parent, 'pay')) {
          return 'Not eligible for pay'
        }
        return week[parent].pay.text || 'Unpaid'
      },
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
          if (!this.cellIsClickable(week, parent, property) || this.isDisabledCell(week, parent)) {
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
      isDisabledCell: function (week, parent) {
        return this.hasNoEligibility(parent) ||
          (parent === 'secondary' && !this.eligibility.secondary.shpp && !this.eligibility.secondary.spl && week.number > 7)
      },
      resetTotals: function () {
        this.leaveWeeks = {
          primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
          secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
        }
        this.shppAndPrimaryInitialPayWeeks = 0
        this.paternityPayWeeks = 0
      },
      updateTotalsForParent: function (parent, week) {
        const isSpl = week[parent].leave.text === 'shared'

        if (week[parent].leave.text && week[parent].leave.eligible) {
          if (isSpl) {
            this.leaveWeeks[parent].spl++
          } else {
            this.leaveWeeks[parent].nonSpl++
          }
        }

        if (week[parent].pay.text && week[parent].pay.eligible) {
          const isPaternity = !isSpl && (parent === 'secondary')

          if (isPaternity) {
            this.paternityPayWeeks++
          } else {
            this.shppAndPrimaryInitialPayWeeks++

            if (!week[parent].leave.eligible) {
              this.leaveWeeks[parent].shppCountedAsSpl++
            }
          }
        }
      },
      formatWeeks: function (number, weekType) {
        number = Math.max(number, 0)
        return '<strong>' + number + '</strong> ' + (weekType ? `${weekType} ` : '') + (number === 1 ? 'week' : 'weeks')
      },
      setHeaderOffset() {
        this.headerOffset = this.$refs.infoAlert.offsetHeight
      },
      printEligibilityTypeLabel: function () {
        if (this.eligibility.primary.spl || this.eligibility.primary.maternityLeave) {
          return 'Leave'
        } else if (this.eligibility.primary.statutoryPay || this.eligibility.primary.shpp) {
          return 'Pay'
        } else {
          return 'Allowance'
        }
      }
    },
    computed: {
      primaryLeaveUsed: function () {
        return this.leaveWeeks.primary.nonSpl
      },
      splUsed: function () {
        return this.leaveWeeks.primary.spl + this.leaveWeeks.secondary.spl
      },
      shppCountedAsSpl: function () {
        return this.leaveWeeks.primary.shppCountedAsSpl + this.leaveWeeks.secondary.shppCountedAsSpl
      },
      sharedLeaveRemaining: function () {
        const leaveBalanceUsed = this.primaryLeaveUsed + this.splUsed + this.shppCountedAsSpl
        return 52 - leaveBalanceUsed
      },
      payUsed: function () {
        return this.shppAndPrimaryInitialPayWeeks
      },
      payRemaining: function () {
        return 39 - this.payUsed
      }
    },
    watch: {
      weeks: {
        immediate: true,
        handler: function (val) {
          this.resetTotals()
          for (let week of val) {
            this.updateTotalsForParent('primary', week)
            this.updateTotalsForParent('secondary', week)
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/govuk/settings/media-queries";
  @import "node_modules/govuk-frontend/govuk/helpers/media-queries";
  @import "node_modules/govuk-frontend/govuk/settings/colours-applied";

  $header-colour: govuk-colour("light-grey");
  $cell-border: 1px solid govuk-colour("light-grey");

  $row-banner-colour: govuk-colour("yellow");

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
      #messages {
        font-weight: normal;
      }
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
    "adoption": lighten(govuk-colour("blue"), 50%),
    "maternity": lighten(govuk-colour("blue"), 50%),
    "paternity": lighten(govuk-colour("red"), 25%),
    "shared": lighten(govuk-colour("light-green"), 25%),
    "compulsory": lighten(govuk-colour("blue"), 25%),
    "disabled": govuk-colour("mid-grey"),
    "unpaid": lighten(govuk-colour("yellow"), 25%)
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
    background-color: map-get($cell-colours, "disabled") !important;
      &.leave:hover:not(.disabled) {
        background-color: hoverify(map-get($cell-colours, "disabled")) !important;
      }
  }

  @mixin cellHoverRules() {
    $empty-cell-background-colour: govuk-colour("white");
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
            background-color: hoverify(map-get($cell-colours, "unpaid"))
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

<style lang="scss" scoped>
  @import "node_modules/govuk-frontend/govuk/settings/colours-applied";

  .govuk-error-summary__body {
    color: $govuk-error-colour;
    font-weight: bold;
  }

  .govuk-error-summary {
    margin-bottom: 0px;
  }
</style>
