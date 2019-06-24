const Weeks = require('./weeks')
const { parseParentFromPlanner, parseStartDay } = require('../utils')
const dataUtils = require('../../common/lib/dataUtils')

function getLeaveBlocks (weeks) {
  return {
    primary: getParentLeaveBlocks(weeks, 'primary'),
    secondary: getParentLeaveBlocks(weeks, 'secondary')
  }
}

function getParentLeaveBlocks (weeks, parent) {
  const blocks = {
    initial: null,
    spl: []
  }

  function store (block) {
    if (block && ['maternity', 'paternity', 'adoption'].includes(block.leave)) {
      blocks.initial = block
    } else {
      blocks.spl.push(block)
    }
  }

  function newBlock (week) {
    return { start: week.number, end: week.number, leave: week.leave }
  }

  const parentLeaveWeeks = weeks
    .map(week => {
      return { number: week.number, leave: week[parent].leave }
    })
    .sort((week1, week2) => week1.number - week2.number)
    .filter(week => week.leave)

  let currentBlock = null
  for (let week of parentLeaveWeeks) {
    if (currentBlock === null) {
      currentBlock = newBlock(week)
    }
    if (week.leave !== currentBlock.leave || week.number - currentBlock.end > 1) {
      store(currentBlock)
      currentBlock = newBlock(week)
    } else {
      currentBlock.end = week.number
    }
  }

  if (currentBlock) {
    store(currentBlock)
  }

  return blocks
}

function getPayBlocks (weeks) {
  const blocks = []

  function newBlock (week) {
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

  if (currentBlock) {
    blocks.push(currentBlock)
  }

  return blocks
}

function getBlocks (data) {
  const weeks = new Weeks({
    isBirth: dataUtils.isBirth(data),
    startWeek: parseStartDay(data),
    primary: parseParentFromPlanner(data, 'primary'),
    secondary: parseParentFromPlanner(data, 'secondary')
  })
    .leaveAndPay()
    .weeks

  return {
    leaveBlocks: getLeaveBlocks(weeks),
    payBlocks: getPayBlocks(weeks)
  }
}

module.exports = {
  getBlocks
}
