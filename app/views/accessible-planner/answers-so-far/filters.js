const _ = require('lodash')

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function appendSplAnswerRows (rows, leaveBlocks) {
    const planningOrder = leaveBlocks['spl-block-planning-order']
    const splBlocks = { primary: [], secondary: [] }
    for (const parent of ['primary', 'secondary']) {
      const parentSpl = leaveBlocks[parent].spl
      if (!parentSpl) {
        break
      }
      let block
      let i = 0
      while ((block = parentSpl[`_${i++}`])) {
        splBlocks[parent].push(block)
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
