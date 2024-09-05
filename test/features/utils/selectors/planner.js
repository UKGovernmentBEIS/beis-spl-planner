const plannerSelectors = {
  remainingLeaveInfoAlert: '#sidebar-information > div > p:nth-child(8) > span > strong',
  remainingLeaveSidebar: '#sidebar-information',
  fathersLeaveCalendar:
    '#calendar > table > tbody > tr:nth-child(21) > td.govuk-table__cell.leave.shared',
  disabledCells: '.govuk-table__cell.leave.disabled'
}

module.exports = plannerSelectors
