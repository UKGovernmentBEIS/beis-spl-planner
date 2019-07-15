const Weeks = require('./weeks')
const { parseParentFromPlanner, parseStartDay } = require('../utils')
const dataUtils = require('../../common/lib/dataUtils')
const { parseEligibilityFromData } = require('./eligibility')

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

  function getLeaveIfEligible (parentWeek) {
    if (parentWeek.leave.eligible) {
      return parentWeek.leave.text || undefined
    } else {
      return undefined
    }
  }

  function store (block) {
    if (block && ['maternity', 'paternity', 'adoption'].includes(block.leave)) {
      blocks.initial = block
    } else {
      blocks.spl.push(block)
    }
  }

  function newBlock (parentLeaveWeek) {
    return { start: parentLeaveWeek.number, end: parentLeaveWeek.number, leave: parentLeaveWeek.leave }
  }

  const parentLeaveWeeks = weeks
    .map(week => {
      return { number: week.number, leave: getLeaveIfEligible(week[parent]) }
    })
    .filter(week => week.leave)
    .sort((week1, week2) => week1.number - week2.number)

  let currentBlock = null
  for (let parentLeaveWeek of parentLeaveWeeks) {
    if (currentBlock === null) {
      currentBlock = newBlock(parentLeaveWeek)
    }
    if (parentLeaveWeek.leave !== currentBlock.leave || parentLeaveWeek.number - currentBlock.end > 1) {
      store(currentBlock)
      currentBlock = newBlock(parentLeaveWeek)
    } else {
      currentBlock.end = parentLeaveWeek.number
    }
  }

  if (currentBlock) {
    store(currentBlock)
  }

  return blocks
}

function getPayBlocks (weeks) {
  const blocks = []

  function getPayIfEligible (week, parent) {
    if (week[parent].pay.eligible) {
      return week[parent].pay.text || undefined
    } else {
      return undefined
    }
  }

  function newBlock (week) {
    return { start: week.number, end: week.number, primary: week.primary, secondary: week.secondary }
  }

  const payWeeks = weeks
    .filter(week => {
      return getPayIfEligible(week, 'primary') || getPayIfEligible(week, 'secondary')
    })
    .map(week => {
      return {
        number: week.number,
        primary: getPayIfEligible(week, 'primary'),
        secondary: getPayIfEligible(week, 'secondary')
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
    secondary: parseParentFromPlanner(data, 'secondary'),
    eligibility: parseEligibilityFromData(data)
  })
    .leaveAndPay()
    .weeks

  return {
    leaveBlocks: getLeaveBlocks(weeks),
    payBlocks: getPayBlocks(weeks)
  }
}

function categorisePayBlocksByType (leaveBlocksSet, payBlocksSet) {
  if (payBlocksSet.length === 0) {
    return []
  }

  const sharedPayBlocks = []
  let initialPayBlock = {
    start: payBlocksSet[0].start,
    end: payBlocksSet[0].end
  }
  let lastSharedPayBlock = null
  let index = 0
  let currentBlock

  while (index < payBlocksSet.length) {
    currentBlock = payBlocksSet[index]
    // if current pay block is within maternity/paternity/adoption statutory leave
    if (currentBlock.start <= leaveBlocksSet.initial.end) {
      if (currentBlock.end <= leaveBlocksSet.initial.end) {
        // if blocks has all weeks within statutory leave
        initialPayBlock.end = currentBlock.end
      } else {
        // else we need to split the block in two
        initialPayBlock.end = leaveBlocksSet.initial.end
        lastSharedPayBlock = {
          start: initialPayBlock.end + 1,
          end: currentBlock.end
        }
      }
    } else if (lastSharedPayBlock === null) {
      // if current pay block is a new separate pay block
      lastSharedPayBlock = {
        start: currentBlock.start,
        end: currentBlock.end
      }
    } else if (lastSharedPayBlock.end === currentBlock.start - 1) {
      // there is a shared pay block adjacent to the current pay block
      lastSharedPayBlock.end = currentBlock.end
    } else {
      // there is a shared pay block but it is not adjacent to current pay block
      sharedPayBlocks.push(lastSharedPayBlock)
      lastSharedPayBlock = {
        start: currentBlock.start,
        end: currentBlock.end
      }
    }

    index++
  }

  if (lastSharedPayBlock) {
    sharedPayBlocks.push(lastSharedPayBlock)
  }

  return {
    initial: initialPayBlock,
    shared: sharedPayBlocks
  }
}

function getAdjustedPayBlocks (leaveBlocks, payBlocks) {
  const primaryPayBlocks = payBlocks.filter((block) => !!block.primary)
  const secondaryPayBlocks = payBlocks.filter((block) => !!block.secondary)

  return {
    primary: categorisePayBlocksByType(leaveBlocks.primary, primaryPayBlocks),
    secondary: categorisePayBlocksByType(leaveBlocks.secondary, secondaryPayBlocks)
  }
}

module.exports = {
  getBlocks,
  getAdjustedPayBlocks
}
