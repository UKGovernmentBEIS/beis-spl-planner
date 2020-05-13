const delve = require('dlv')
const _ = require('lodash')
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
  for (const parentLeaveWeek of parentLeaveWeeks) {
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

  for (const week of payWeeks) {
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

function parseLeaveBlocksIntoLeaveAndPay (dataObject, leaveBlocksDataObject) {
  const leaveBlocks = parseLeaveBlocks(leaveBlocksDataObject)
  const leave = createArrayFromLeaveBlocks(leaveBlocks)
  for (const parent in leave) {
    dataObject[parent].leave = leave[parent]
    dataObject[parent].pay = leave[parent]
  }
}

function getBlocks (data) {
  const dataClone = _.cloneDeep(data)
  const leaveBlocksDataObject = dataClone['leave-blocks']
  if (leaveBlocksDataObject) {
    parseLeaveBlocksIntoLeaveAndPay(dataClone, leaveBlocksDataObject)
  }

  const weeks = new Weeks({
    natureOfParenthood: dataUtils.natureOfParenthood(dataClone),
    typeOfAdoption: dataUtils.typeOfAdoption(dataClone),
    startWeek: parseStartDay(dataClone),
    primary: parseParentFromPlanner(dataClone, 'primary'),
    secondary: parseParentFromPlanner(dataClone, 'secondary'),
    eligibility: parseEligibilityFromData(dataClone)
  })
    .leaveAndPay()
    .weeks

  return {
    leaveBlocks: getLeaveBlocks(weeks),
    payBlocks: getPayBlocks(weeks)
  }
}

function createArrayFromLeaveBlocks (leaveBlocks) {
  const leave = {
    primary: [],
    secondary: []
  }
  for (const parent in leaveBlocks) {
    for (const leaveType in leaveBlocks[parent]) {
      if (leaveType === 'spl') {
        for (let leaveObj in leaveBlocks[parent][leaveType]) {
          leaveObj = leaveBlocks[parent][leaveType][leaveObj]
          const leaveArr = createLeaveArray(leaveObj.start, leaveObj.end)
          leave[parent] = leave[parent].concat(leaveArr)
        }
      } else {
        const leaveObj = leaveBlocks[parent][leaveType]
        const leaveArr = leaveObj === null ? null : createLeaveArray(leaveObj.start, leaveObj.end)
        leave[parent] = leave[parent].concat(leaveArr)
      }
    }
  }
  return leave
}

function createLeaveArray (start, end) {
  const leave = []
  for (let i = start; i <= end; i++) {
    leave.push(i.toString())
  }
  return leave
}

function parseLeaveBlocks (leaveBlocksDataObject) {
  const blocks = {
    primary: {
      initial: parseInitialLeaveBlock(leaveBlocksDataObject, 'primary'),
      spl: parseSplLeaveBlocks(leaveBlocksDataObject, 'primary')
    },
    secondary: {
      initial: parseInitialLeaveBlock(leaveBlocksDataObject, 'secondary'),
      spl: parseSplLeaveBlocks(leaveBlocksDataObject, 'secondary')
    }
  }
  return blocks
}

function parseInitialLeaveBlock (leaveBlocksDataObject, parent) {
  const blockDataObject = delve(leaveBlocksDataObject, [parent, 'initial'], null)
  return parseLeaveBlock(blockDataObject)
}

function parseSplLeaveBlocks (leaveBlocksDataObject, parent) {
  const splLeaveBlocksDataObject = delve(leaveBlocksDataObject, [parent, 'spl'], {})
  const blockDataObjects = []

  // The SPL object in data indexes the blocks with keys like "_0", "_1", "_2", etc.
  let i = 0
  let block
  const getBlock = n => splLeaveBlocksDataObject[`_${n}`]
  while (isBlockDataObject(block = getBlock(i++))) {
    blockDataObjects.push(block)
  }

  return blockDataObjects.map(obj => parseLeaveBlock(obj))
}

function parseLeaveBlock (obj) {
  if (!isBlockDataObject(obj)) {
    return null
  }
  return {
    leave: obj.leave,
    start: parseInt(obj.start),
    end: parseInt(obj.end)
  }
}

function getRemainingLeaveAllowance (leaveBlocks) {
  const initialPrimaryLeave = delve(leaveBlocks, 'primary.initial', {})
  const primarySpl = delve(leaveBlocks, 'primary.spl', [])
  const secondarySpl = delve(leaveBlocks, 'secondary.spl', [])
  const blocks = [initialPrimaryLeave, ...primarySpl, ...secondarySpl]
  const totalAllowanceUsed = blocks.reduce((total, block) => total + getBlockLength(block), 0)
  return 52 - totalAllowanceUsed
}

function getBlockLength (block) {
  if (!block || isNaN(block.start) || isNaN(block.end)) {
    return 0
  }
  return parseInt(block.end) - parseInt(block.start) + 1
}

function isBlockDataObject (obj) {
  return _.isObject(obj) &&
    obj.leave !== undefined &&
    !isNaN(parseInt(obj.start)) &&
    !isNaN(parseInt(obj.end))
}

function categorisePayBlocksByType (leaveBlocksSet, payBlocksSet) {
  if (payBlocksSet.length === 0) {
    return {
      initial: null,
      shared: []
    }
  }

  const sharedPayBlocks = []
  const initialPayBlock = {
    start: payBlocksSet[0].start,
    end: payBlocksSet[0].end
  }
  let lastSharedPayBlock = null

  for (const currentBlock of payBlocksSet) {
    // if current pay block is within maternity/paternity/adoption statutory leave
    if (leaveBlocksSet.initial && currentBlock.start <= leaveBlocksSet.initial.end) {
      // if current pay block is within maternity/paternity/adoption statutory leave
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
  getAdjustedPayBlocks,
  parseSplLeaveBlocks,
  parseLeaveBlocks,
  getRemainingLeaveAllowance,
  getBlockLength,
  parseLeaveBlocksIntoLeaveAndPay
}
