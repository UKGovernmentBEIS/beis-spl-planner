const Vue = require('vue/dist/vue.common')
const ShareLink = require('./components/ShareLink.vue')
const { parseParentFromPlanner } = require('../../utils')

function init (data) {
  const primary = parseParentFromPlanner(data, 'primary')
  const secondary = parseParentFromPlanner(data, 'secondary')
  const summaryTabs = ['leave', 'pay']
  summaryTabs.forEach(summaryTab => {
    new (Vue.extend(ShareLink))({
      el: `#${summaryTab}-summary-share-link`,
      data: {
        pageType: 'summary'
      },
      propsData: {
        primary,
        secondary,
        formData: data
      }
    })
  })
}

module.exports = {
  init
}
