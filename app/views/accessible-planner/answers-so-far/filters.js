const _ = require('lodash')
const delve = require('dlv')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  const parentName = env.getFilter('parentName')

  function appendSplAnswerRows (rows, data, dateMacro) {
    const leaveBlocks = data['leave-blocks']
    const splBlocks = { primary: [], secondary: [] }
    for (const parent of ['primary', 'secondary']) {
      const parentSpl = delve(leaveBlocks, [parent, 'spl'])
      if (!parentSpl) {
        continue
      }
      let block
      let i = 0
      while ((block = parentSpl[`_${i++}`])) {
        splBlocks[parent].push(block)
      }
    }
    const splPlanningOrder = _.castArray(delve(leaveBlocks, 'spl-block-planning-order', []))
    for (let i = 0; i < splPlanningOrder.length; i++) {
      const parent = splPlanningOrder[i]
      if (!splBlocks[parent] || splBlocks[parent].length === 0) {
        continue
      }
      const splBlock = splBlocks[parent].shift()
      const blockSummary = startOrEnd => `SPL block ${i + 1} of ${splPlanningOrder.length} ${startOrEnd} (${parentName(data, parent)})`
      if (splBlock.start) {
        rows.push({
          key: {
            text: blockSummary('start')
          },
          value: {
            text: dateMacro(data, splBlock.start)
          },
          actions: {
            items: [
              {
                href: `/planner/shared-parental-leave/start?block=${i + 1}`,
                text: 'Change',
                visuallyHiddenText: 'Shared Parental Leave start'
              }
            ]
          }
        })
      }
      if (splBlock.end) {
        rows.push({
          key: {
            text: blockSummary('end')
          },
          value: {
            text: dateMacro(data, splBlock.end)
          },
          actions: {
            items: [
              {
                href: `/planner/shared-parental-leave/end?block=${i + 1}`,
                text: 'Change',
                visuallyHiddenText: 'Shared Parental Leave end'
              }
            ]
          }
        })
      }
    }
    return rows
  }

  function removeRowsWithEmptyValues (rows) {
    return rows.filter(row => row.value && (_.trim(row.value.text) || _.trim(row.value.html)))
  }

  return {
    appendSplAnswerRows,
    removeRowsWithEmptyValues
  }
}
