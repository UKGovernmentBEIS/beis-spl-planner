const leaveSummarySelectors = {
  babyDueDate: '#leave-summary > div > div > dl:nth-child(4) > div > dd',
  maternityLeaveStarts:
    '#leave-summary > div > div > dl:nth-child(7) > div:nth-child(1) > dd',
  maternityLeaveEnds:
    '#leave-summary > div > div > dl:nth-child(7) > div:nth-child(2) > dd',
  maternityLeaveLength:
    '#leave-summary > div > div > dl:nth-child(7) > div:nth-child(3) > dd',
  notifyEmployerMaternity:
    '#leave-summary > div > div > dl:nth-child(7) > div:nth-child(4) > dd',
  paternityLeaveStarts:
    '#leave-summary > div > div > dl:nth-child(11) > div:nth-child(1) > dd',
  parentalLeaveLength:
    '#leave-summary > div > div > dl:nth-child(11) > div:nth-child(2) > dd',
  notifyEmployerPaternity:
    '#leave-summary > div > div > dl:nth-child(11) > div:nth-child(3) > dd',
  sharedParentalLeaveStart:
    '#leave-summary > div > div > dl:nth-child(13) > div:nth-child(1) > dd',
  sharedParentalLeaveEnd:
    '#leave-summary > div > div > dl:nth-child(13) > div:nth-child(2) > dd',
  sharedParentalLeaveLength:
    '#leave-summary > div > div > dl:nth-child(13) > div:nth-child(3) > dd',
  notifyEmployerShared:
    '#leave-summary > div > div > dl:nth-child(13) > div:nth-child(4) > dd'
}

module.exports = leaveSummarySelectors
