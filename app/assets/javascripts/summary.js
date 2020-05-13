const Vue = require('vue/dist/vue.common')
const ShareLink = require('./components/ShareLink.vue')
const { parseParentFromPlanner } = require('../../utils')
const _ = require('lodash')
const { parseLeaveBlocksIntoLeaveAndPay } = require('../../lib/blocks')

function init (data) {
  const dataClone = _.cloneDeep(data)
  if (!dataClone['visualPlanner']) {
    parseLeaveBlocksIntoLeaveAndPay(dataClone, dataClone['leave-blocks'])
  }
  const primary = parseParentFromPlanner(dataClone, 'primary')
  const secondary = parseParentFromPlanner(dataClone, 'secondary')
  const summaryTabs = ['leave', 'pay']
  summaryTabs.forEach(summaryTab => {
    // eslint-disable-next-line no-new
    new (Vue.extend(ShareLink))({
      el: `#${summaryTab}-summary-share-link`,
      data: {
        pageType: 'summary'
      },
      propsData: {
        primary,
        secondary,
        formData: dataClone
      }
    })
  })
}

module.exports = {
  init
}
