const delve = require('dlv')
const isString = require('lodash/isString')
const validate = require('./validate')

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
        workflowParentPath: '/parent-salaries'
      },
      summary: {
        url: '/summary',
        workflowParentPath: '/planner'
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

  getPreviousWorkFlowPath (url) {
    const pathObject = this.getPathObjectFromUrl(url)
    return pathObject ? pathObject.workflowParentPath : undefined
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
