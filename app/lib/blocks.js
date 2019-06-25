const Weeks = require('./weeks')
const { parseParentFromPlanner } = require('../utils')

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
    // TODO commonise with filters
    isBirth: data['birth-or-adoption'] === 'birth',
    // TODO get from data
    startWeek: '2019-09-08',
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

function categorisePayBlocksByType (leaveBlocksSet, payBlocksSet) {
  if (payBlocksSet.length == 0)
    return [];
  
  const sharedPayBlocks = [];
  let initialPayBlock = {
    start: payBlocksSet[0].start,
    end: payBlocksSet[0].end
  };
  let lastSharedPayBlock = null;
  let index = 0;
  let currentBlock;

  while (index < payBlocksSet.length) {
      currentBlock = payBlocksSet[index];
      // if current pay block is within maternity/paternity/adoption statutory leave
      if (currentBlock.start <= leaveBlocksSet.initial.end) {
        // if blocks has all weeks within statutory leave
        if (currentBlock.end <= leaveBlocksSet.initial.end) {
          initialPayBlock.end = currentBlock.end;
        }
        // else we need to split the block in two
        else {
          initialPayBlock.end = leaveBlocksSet.initial.end;
          lastSharedPayBlock = {
            start: initialPayBlock.end + 1,
            end: currentBlock.end
          };
        }
      }
      // if current pay block is a new separate pay block
      else if (lastSharedPayBlock === null) {
        lastSharedPayBlock = {
          start: currentBlock.start,
          end: currentBlock.end
        };
      }
      // there is a shared pay block adjacent to the current pay block
      else if (lastSharedPayBlock.end === currentBlock.start - 1) {
        lastSharedPayBlock.end = currentBlock.end;
      }
      // there is a shared pay block but it is not adjacent to current pay block
      else {
        sharedPayBlocks.push(lastSharedPayBlock);
        lastSharedPayBlock = {
          start: currentBlock.start,
          end: currentBlock.end
        };
      }

      index++;
  }

  if (lastSharedPayBlock != null)
    sharedPayBlocks.push(lastSharedPayBlock);

  return {
    initial: initialPayBlock,
    shared: sharedPayBlocks
  }
}

function getAdjustedPayBlocks (leaveBlocks, payBlocks) {
  const primaryPayBlocks = payBlocks.filter((block) => block.primary != undefined);
  const secondaryPayBlocks = payBlocks.filter((block) => block.secondary != undefined);

  return {
    primary: categorisePayBlocksByType(leaveBlocks.primary, primaryPayBlocks),
    secondary: categorisePayBlocksByType(leaveBlocks.secondary, secondaryPayBlocks)
  }
}

module.exports = {
  getBlocks,
  getAdjustedPayBlocks
}
