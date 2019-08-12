const express = require('express')
const router = express.Router()
const _ = require('lodash')
const Day = require('../common/lib/day')
const { isSurrogacy } = require('../common/lib/dataUtils')

const exampleDate = new Day().add(3, 'months')
const exampleDateData = {
  'start-date-year': exampleDate.format('YYYY'),
  'start-date-month': exampleDate.format('MM'),
  'start-date-day': exampleDate.format('DD')
}

const exampleEligibilityData = {
  'spl-eligible': 'yes',
  'shpp-eligible': 'yes'
}

function examples (offset) {
  function rangeWithOffset (lower, upper) {
    return _.range(lower + offset, upper + offset)
  }

  return {
    // don't offset leave/pay where it is connected to the partner taking Paternity Leave in the start week
    'managing-parenting-and-work': {
      primary: {
        leave: [
          ...rangeWithOffset(-2, 33),
          ...rangeWithOffset(42, 46)
        ],
        pay: [
          ...rangeWithOffset(-2, 33)
        ]
      },
      secondary: {
        leave: [
          ..._.range(0, 2),
          ...rangeWithOffset(29, 42)
        ],
        pay: [
          ..._.range(0, 2),
          ...rangeWithOffset(38, 42)
        ]
      }
    },
    'extending-time-as-a-family': {
      primary: {
        leave: [
          ...rangeWithOffset(-2, 46)
        ],
        pay: [
          ...rangeWithOffset(-2, 37)
        ]
      },
      secondary: {
        leave: [
          ..._.range(0, 6)
        ],
        pay: [
          ..._.range(0, 2)
        ]
      }
    },
    'sharing-primary-care-responsibility': {
      primary: {
        leave: [
          ...rangeWithOffset(-2, 11),
          ..._.range(17, 23),
          ..._.range(29, 35)
        ],
        pay: [
          ...rangeWithOffset(-2, 11),
          ..._.range(17, 23),
          ..._.range(29, 35)
        ]
      },
      secondary: {
        leave: [
          ..._.range(0, 17),
          ..._.range(23, 29),
          ..._.range(35, 41)
        ],
        pay: [
          ..._.range(0, 16)
        ]
      }
    }
  }
}

// this runs when the app starts so we don't know the offset yet, but we only need the keys so it doesn't matter
for (const exampleName of Object.keys(examples(0))) {
  router.get(`/:natureOfParenthood(birth|adoption|surrogacy)/${exampleName}`, function (req, res) {
    // calculate the offset now we know natureOfParenthood
    const offset = isSurrogacy(req.params.natureOfParenthood) ? 2 : 0
    const data = examples(offset)[exampleName]
    Object.assign(data.primary, exampleEligibilityData)
    Object.assign(data.secondary, exampleEligibilityData)
    const exampleData = {
      'nature-of-parenthood': req.params.natureOfParenthood,
      ...exampleDateData,
      ...data
    }
    res.render(`examples/${exampleName}`, { exampleData })
  })
}

module.exports = router
