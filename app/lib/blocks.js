const Weeks = require('./weeks')
const { parseParentFromPlanner } = require('../utils')

function getLeaveBlocks (weeks) {
  return {
    primary: getParentLeaveBlocks(weeks, 'primary'),
    secondary: getParentLeaveBlocks(weeks, 'secondary')
  }
}

function getParentLeaveBlocks (weeks, parent) {
  const newBlock = week => {
    return { start: week.number, end: week.number, leave: week.leave }
  }
  const parentLeaveWeeks = weeks
    .map(week => {
      return { number: week.number, leave: week[parent].leave }
    })
    .sort((week1, week2) => week1.number - week2.number)
    .filter(week => week.leave)

  const blocks = []

  let currentBlock = null
  for (let week of parentLeaveWeeks) {
    if (currentBlock === null) {
      currentBlock = newBlock(week)
    }
    if (week.leave !== currentBlock.leave || week.number - currentBlock.end > 1) {
      blocks.push(currentBlock)
      currentBlock = newBlock(week)
    } else {
      currentBlock.end = week.number
    }
  }
  blocks.push(currentBlock)

  return blocks
}

function getPayBlocks (weeks) {
  const newBlock = week => {
    return { start: week.number, end: week.number, primary: week.primary, secondary: week.secondary }
  }

  const payWeeks = weeks
    .filter(week => week.primary.pay || week.secondary.pay)
    .map(week => {
      return {
        number: week.number,
        primary: week.primary.pay,
        secondary: week.secondary.pay
      }
    })

  const blocks = []
  let currentBlock = null

  for (let week of payWeeks) {
    if (currentBlock === null) {
      currentBlock = newBlock(week)
    }
    if (week.primary !== currentBlock.primary ||
        week.secondary !== currentBlock.secondary ||
        week.number - currentBlock.end > 1
    ) {
      blocks.push(currentBlock)
      currentBlock = newBlock(week)
    } else {
      currentBlock.end = week.number
    }
  }
  blocks.push(currentBlock)

  return blocks
}

function getBlocks (data) {
  const weeks = new Weeks({
    // TODO commonise with filters
    isBirth: data['birth-or-adoption'] === 'birth',
    // TODO get from data
    startWeek: '2019-09-08',
    primary: parseParentFromPlanner(data, 'primary'),
    secondary: parseParentFromPlanner(data, 'secondary')
  })
    .leaveAndPay()
    .weeks

  getLeaveBlocks(weeks)
  getPayBlocks(weeks)

  return {
    leaveBlocks: getLeaveBlocks(weeks),
    payBlocks: getPayBlocks(weeks)
  }
}

module.exports = {
  getBlocks
}
