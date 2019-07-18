const express = require('express')
const router = express.Router()
const _ = require('lodash')
const Day = require('../common/lib/day')

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

const examples = {
  'managing-parenting-and-work': {
    primary: {
      leave: [
        ..._.range(-2, 33),
        ..._.range(42, 46)
      ],
      pay: [
        ..._.range(-2, 33)
      ]
    },
    secondary: {
      leave: [
        ..._.range(0, 2),
        ..._.range(29, 42)
      ],
      pay: [
        ..._.range(0, 2),
        ..._.range(38, 42)
      ]
    }
  },
  'extending-time-as-a-family': {
    primary: {
      leave: [
        ..._.range(-2, 46)
      ],
      pay: [
        ..._.range(-2, 37)
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
        ..._.range(-2, 11),
        ..._.range(17, 23),
        ..._.range(29, 35)
      ],
      pay: [
        ..._.range(-2, 11),
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

for (const [name, data] of Object.entries(examples)) {
  Object.assign(data.primary, exampleEligibilityData)
  Object.assign(data.secondary, exampleEligibilityData)
  router.get(`/:birthOrAdoption(birth|adoption)/${name}`, function (req, res) {
    const exampleData = {
      'birth-or-adoption': req.params.birthOrAdoption,
      ...exampleDateData,
      ...data
    }
    res.render(`examples/${name}`, { exampleData })
  })
}

module.exports = router
