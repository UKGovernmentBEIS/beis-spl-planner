const delve = require('dlv')
const isString = require('lodash/isString')
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
*/

class Paths {
  constructor () {
    this.pathObjects = {
      root: {
        url: '/'
      },
      birthOrAdoption: {
        url: '/birth-or-adoption',
        workflowParentPath: '/',
        validator: validate.birthOrAdoption
      },
      eligibility: {
        mother: {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/mother/shared-parental-leave-and-pay',
            workflowParentPath: '/birth-or-adoption',
            validator: validate.primarySharedParentalLeaveAndPay
          },
          initialLeaveAndPay: {
            url: '/eligibility/mother/initial-leave-and-pay',
            workflowParentPath: '/eligibility/mother/shared-parental-leave-and-pay',
            validator: validate.initialLeaveAndPay
          },
          maternityAllowance: {
            url: '/eligibility/mother/maternity-allowance',
            workflowParentPath: '/eligibility/mother/initial-leave-and-pay',
            validator: validate.maternityAllowance
          }
        },
        'primary-adopter': {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/primary-adopter/shared-parental-leave-and-pay',
            workflowParentPath: '/birth-or-adoption',
            validator: validate.primarySharedParentalLeaveAndPay
          },
          initialLeaveAndPay: {
            url: '/eligibility/primary-adopter/initial-leave-and-pay',
            workflowParentPath: '/eligibility/primary-adopter/shared-parental-leave-and-pay',
            validator: validate.initialLeaveAndPay
          },
          maternityAllowance: {
            url: '/eligibility/primary-adopter/maternity-allowance',
            workflowParentPath: '/eligibility/primary-adopter/initial-leave-and-pay'
          }
        },
        partner: {
          sharedParentalLeaveAndPay: {
            url: '/eligibility/partner/shared-parental-leave-and-pay',
            workflowParentPath: '/eligibility/mother/maternity-allowance',
            validator: validate.secondarySharedParentalLeaveAndPay
          },
          paternityLeaveAndPay: {
            url: '/eligibility/partner/paternity-leave-and-pay',
            workflowParentPath: '/eligibility/partner/shared-parental-leave-and-pay',
            validator: validate.paternityLeaveAndPay
          }
        }
      },
      notEligible: {
        url: '/not-eligible',
        workflowParentPath: '/eligibility/partner/shared-parental-leave-and-pay'
      },
      startDate: {
        url: '/start-date',
        workflowParentPath: '/eligibility/partner/paternity-leave-and-pay',
        validator: validate.startDate
      },
      parentSalaries: {
        url: '/parent-salaries',
        workflowParentPath: '/start-date',
        validator: validate.parentSalaries
      },
      planner: {
        url: '/planner',
        workflowParentPath: '/parent-salaries',
        validator: validate.planner,
        'maternity-leave': {
          start: {
            url: '/planner/maternity-leave/start',
            workflowParentPath: '/planner'
          },
          end: {
            url: '/planner/maternity-leave/end',
            workflowParentPath: '/planner/maternity-leave/start'
          }
        },
        'adoption-leave': {
          start: {
            url: '/planner/adoption-leave/start',
            workflowParentPath: '/planner'
          },
          end: {
            url: '/planner/adoption-leave/end',
            workflowParentPath: '/planner/adoption-leave/start'
          }
        },
        'paternity-leave': {
          url: '/planner/paternity-leave',
          workflowParentPath: {
            birth: '/planner/maternity-leave/end',
            adoption: '/planner/adoption-leave/end'
          },
          start: {
            url: '/planner/paternity-leave/start',
            workflowParentPath: '/planner/paternity-leave'
          },
          end: {
            url: '/planner/paternity-leave/end',
            workflowParentPath: '/planner/paternity-leave/start'
          }
        },
        'shared-parental-leave': {
          url: '/planner/shared-parental-leave',
          workflowParentPath: '/planner/paternity-leave/end',
          start: {
            url: '/planner/shared-parental-leave/start',
            workflowParentPath: '/planner/shared-parental-leave'
          },
          end: {
            url: '/planner/shared-parental-leave/end',
            workflowParentPath: '/planner/shared-parental-leave/start'
          }
        }
      },
      summary: {
        url: '/summary',
        workflowParentPath: '/planner'
      },
      feedback: {
        url: '/feedback'
      },
      cookies: {
        url: '/cookies'
      }
    }
  }

  getPathObjectFromUrl (url) {
    function findObjectByUrl (obj, url) {
      for (let key in obj) {
        const subObject = obj[key]
        if (isString(subObject)) {
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

  getPreviousWorkflowPath (url, data) {
    const pathObject = this.getPathObjectFromUrl(url)
    const workflowParentPath = delve(pathObject, 'workflowParentPath', undefined)
    if (!workflowParentPath) {
      return undefined
    } else if (typeof workflowParentPath === 'string') {
      return workflowParentPath
    } else if (workflowParentPath.birth && workflowParentPath.adoption) {
      return dataUtils.isBirth(data) ? workflowParentPath.birth : workflowParentPath.adoption
    } else {
      return undefined
    }
  }

  getPath (location) {
    const pathLocation = location.split('.')
    return delve(this.pathObjects, pathLocation.concat(['url']))
  }

  getAllPaths () {
    function searchForUrl (obj) {
      let output = []
      for (let key in obj) {
        const subObj = obj[key]

        if (isString(subObj)) {
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
