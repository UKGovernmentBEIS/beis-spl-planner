function getLeaveBlocks (data) {
  return ['primary', 'secondary'].reduce((outputObject, parent) => {
    outputObject[parent] = buildLeaveBlocks(data[parent].leave)
    return outputObject
  }, {})
}

function buildLeaveBlocks (leaveWeeks) {
  const output = []
  const preparedWeeks = leaveWeeks.map(weekNum => parseInt(weekNum)).sort((x, y) => x - y)

  let currentBlock
  preparedWeeks.forEach(week => {
    if (!currentBlock) {
      currentBlock = { start: week, end: week }
    } else if (currentBlock.end < week - 1) {
      output.push(currentBlock)
      currentBlock = { start: week, end: week }
    } else {
      currentBlock.end = week
    }
  })
  output.push(currentBlock)

  return output
}

function getPayBlocks () { return [] }

module.exports = {
  getLeaveBlocks,
  getPayBlocks
}
