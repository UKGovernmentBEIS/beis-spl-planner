const plannerSelectors = {
  remainingLeaveSidebar: '#sidebar-information',
  fathersLeaveCalendar:
    '.govuk-body:text-is("Shared Parental Leave")',
  disabledCells: '.govuk-table__cell.leave.disabled',
  cellSelector: (week, parent) =>
    `td[data-row="${week}"][data-column="${parent === 'mother' ? 0 : 2}"]`,
  notEligibleCellSelector: (week, parent) =>
    `td[headers~="week-${week}-date"][headers~="${
      parent === 'mother' ? 'primary-leave' : 'secondary-leave'
    }"] .govuk-body-s.no-margin`
}

module.exports = plannerSelectors
