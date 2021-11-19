const delve = require('dlv')
const _ = require('lodash')
const validate = require('./validate')
const dataUtils = require('../common/lib/dataUtils')

/*
 * This class is used to manage all paths in the app.
 * An example pathObjects is given below:
 * {
 *    root: {
 *      url: '/'
 *    },
 *    firstPage: {
 *      url: '/first-page',
 *      workflowParentPath: '/'
 *      validator: firstPageValidatorFunction
 *    },
 *    secondPage: {
 *      firstCategory: {
 *        url: '/second-page/first-category,
 *        workflowParentPath: '/first-page',
 *        validator: secondPageValidatorFunction
 *      }
 *      secondCategory: {
 *        url: '/second-page/second-category,
 *        workflowParentPath: '/first-page',
 *        validator: secondPageValidatorFunction
 *      }
 *    }
 * }
 *
 * A path can be accessed using #getPath and passing a . seperated string of the necessary keys. For example,
 * paths.getAllPaths('secondPage.firstCategory') returns '/secondPage/first-category
 *
 * A path object can be accessed by passing the url to getPathObjectFromUrl
 *
 * The workflowParentPath property can take a function, which is called with the data object.
*/

class Paths {
  constructor () {
    this.pathObjects = {
      root: {
        url: '/',
        workFlowPage: true,
      },
      natureOfParenthood: {
        url: '/nature-of-parenthood',
        workFlowPage: true,
        workflowParentPath: '/',
        validator: validate.natureOfParenthood
      },
      typeOfAdoption: {
        url: '/type-of-adoption',
        workFlowPage: true,
        workflowParentPath: '/nature-of-parenthood',
        validator: validate.typeOfAdoption
      },
      eligibility: {
        mother: {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/mother/shared-parental-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/nature-of-parenthood',
            validator: validate.primarySharedParentalLeaveAndPay
          },
          initialLeaveAndPay: {
            url: '/eligibility/mother/initial-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/eligibility/mother/shared-parental-leave-and-pay',
            validator: validate.initialLeaveAndPay
          },
          maternityAllowance: {
            url: '/eligibility/mother/maternity-allowance',
            workFlowPage: true,
            workflowParentPath: '/eligibility/mother/initial-leave-and-pay',
            validator: validate.maternityAllowance
          }
        },
        'primary-adopter': {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/primary-adopter/shared-parental-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/type-of-adoption',
            validator: validate.primarySharedParentalLeaveAndPay
          },
          initialLeaveAndPay: {
            url: '/eligibility/primary-adopter/initial-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/eligibility/primary-adopter/shared-parental-leave-and-pay',
            validator: validate.initialLeaveAndPay
          }
        },
        'parental-order-parent': {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/parental-order-parent/shared-parental-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/nature-of-parenthood',
            validator: validate.primarySharedParentalLeaveAndPay
          },
          initialLeaveAndPay: {
            url: '/eligibility/parental-order-parent/initial-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/eligibility/parental-order-parent/shared-parental-leave-and-pay',
            validator: validate.initialLeaveAndPay
          }
        },
        partner: {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/partner/shared-parental-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: data => {
              if (dataUtils.isBirth(data)) {
                return '/eligibility/mother/maternity-allowance'
              } else if (dataUtils.isAdoption(data)) {
                return '/eligibility/primary-adopter/initial-leave-and-pay'
              } else {
                return '/eligibility/parental-order-parent/initial-leave-and-pay'
              }
            },
            validator: validate.secondarySharedParentalLeaveAndPay
          },
          paternityLeaveAndPay: {
            url: '/eligibility/partner/paternity-leave-and-pay',
            workFlowPage: true,
            workflowParentPath: '/eligibility/partner/shared-parental-leave-and-pay',
            validator: validate.paternityLeaveAndPay
          }
        }
      },
      notEligible: {
        url: '/not-eligible',
        workFlowPage: true,
        workflowParentPath: data => {
          if (dataUtils.isPrimaryIneligible(data)) {
            if (dataUtils.isBirth(data)) {
              return '/eligibility/mother/maternity-allowance'
            } else if (dataUtils.isAdoption(data)) {
              return '/eligibility/primary-adopter/initial-leave-and-pay'
            } else {
              return '/eligibility/parental-order-parent/initial-leave-and-pay'
            }
          } else {
            return '/eligibility/partner/shared-parental-leave-and-pay'
          }
        }
      },
      startDate: {
        url: '/start-date',
        workFlowPage: true,
        workflowParentPath: '/eligibility/partner/paternity-leave-and-pay',
        validator: validate.startDate
      },
      parentSalaries: {
        url: '/parent-salaries',
        workFlowPage: true,
        workflowParentPath: '/start-date',
        validator: validate.parentSalaries
      },
      planner: {
        url: '/planner',
        workFlowPage: true,
        workflowParentPath: '/parent-salaries',
        validator: validate.planner,
        'maternity-leave': {
          start: {
            url: '/planner/maternity-leave/start',
            workFlowPage: true,
            workflowParentPath: '/planner'
          },
          end: {
            url: '/planner/maternity-leave/end',
            workFlowPage: true,
            workflowParentPath: '/planner/maternity-leave/start'
          }
        },
        'adoption-leave': {
          start: {
            url: '/planner/adoption-leave/start',
            workFlowPage: true,
            workflowParentPath: '/planner'
          },
          end: {
            url: '/planner/adoption-leave/end',
            workFlowPage: true,
            workflowParentPath: '/planner/adoption-leave/start'
          }
        },
        'paternity-leave': {
          url: '/planner/paternity-leave',
          workFlowPage: true,
          workflowParentPath: data => {
            if (dataUtils.isBirth(data)) {
              return '/planner/maternity-leave/end'
            } else {
              return '/planner/adoption-leave/end'
            }
          },
          start: {
            url: '/planner/paternity-leave/start',
            workFlowPage: true,
            workflowParentPath: '/planner/paternity-leave'
          },
          end: {
            url: '/planner/paternity-leave/end',
            workFlowPage: true,
            workflowParentPath: '/planner/paternity-leave/start'
          }
        },
        'shared-parental-leave': {
          url: '/planner/shared-parental-leave',
          workFlowPage: true,
          workflowParentPath: (data, isForValidator) => {
            if (isForValidator) {
              // Prevent circular reference when validating page history.
              return '/planner/paternity-leave/end'
            }
            const splBlockPlanningOrder = dataUtils.splBlockPlanningOrder(data)
            return splBlockPlanningOrder.length > 0 ? '/planner/shared-parental-leave/end' : '/planner/paternity-leave/end'
          },
          start: {
            url: '/planner/shared-parental-leave/start',
            workFlowPage: true,
            workflowParentPath: '/planner/shared-parental-leave'
          },
          end: {
            url: '/planner/shared-parental-leave/end',
            workFlowPage: true,
            workflowParentPath: '/planner/shared-parental-leave/start'
          }
        }
      },
      summary: {
        url: '/summary',
        workFlowPage: true,
        workflowParentPath: data => {
          if (!data['leave-blocks']) {
            return '/planner'
          }
          const splBlockPlanningOrder = dataUtils.splBlockPlanningOrder(data)
          if (splBlockPlanningOrder[splBlockPlanningOrder.length - 1] === 'done') {
            return '/planner/shared-parental-leave'
          } else if (splBlockPlanningOrder.includes('primary') || splBlockPlanningOrder.includes('secondary')) {
            return '/planner/shared-parental-leave/end'
          } else if (delve(data, 'leave-blocks.secondary.is-taking-paternity-leave', false)) {
            return '/planner/paternity-leave/end'
          } else {
            return '/planner/paternity-leave'
          }
        }
      },
      feedback: {
        workFlowPage: false,
        url: '/feedback'
      },
      feedbackConfirmation: {
        workFlowPage: false,
        url: '/feedback/confirmation'
      },
      cookies: {
        workFlowPage: false,
        url: '/cookies'
      },
      'contact-us': {
        workFlowPage: false,
        url: '/contact-us'
      },
      accessibilityStatement: {
        workFlowPage: false,
        url: '/accessibility-statement'
      }
    }
  }

  getPathObjectFromUrl (url) {
    function findObjectByUrl (obj, url) {
      for (const key in obj) {
        const subObject = obj[key]
        if (_.isString(subObject)) {
          continue
        }

        if (subObject.url === url) {
          return subObject
        }

        const objectMatchingUrl = findObjectByUrl(subObject, url)
        if (objectMatchingUrl) {
          return objectMatchingUrl
        }
      }
    }

    return findObjectByUrl(this.pathObjects, url)
  }

  getPreviousWorkflowPath (url, data, isForValidator) {
    const pathObject = this.getPathObjectFromUrl(url)
    const workflowParentPath = delve(pathObject, 'workflowParentPath', undefined)
    return _.isFunction(workflowParentPath) ? workflowParentPath(data, isForValidator) : workflowParentPath
  }

  isWorkFlowPage (url) {
    const pathObject = this.getPathObjectFromUrl(url)
    return delve(pathObject, 'workFlowPage', false)
  }

  getPath (location) {
    const pathLocation = location.split('.')
    return delve(this.pathObjects, pathLocation.concat(['url']))
  }

  getAllPaths () {
    function searchForUrl (obj) {
      let output = []
      for (const key in obj) {
        const subObj = obj[key]

        if (_.isString(subObj)) {
          continue
        }

        if (subObj.url) {
          output.push(subObj.url)
        }

        output = output.concat(searchForUrl(subObj))
      }
      return output
    }

    return searchForUrl(this.pathObjects)
  }

  getValidator (url) {
    return this.getPathObjectFromUrl(url).validator
  }
}

const paths = new Paths()

module.exports = paths
