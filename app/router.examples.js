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

const examples = {
  'managing-parenting-and-work': {
    primary: {
      leave: [
        ..._.range(-2, 33),
        ..._.range(42, 46)
      ],
      pay: [
        ..._.range(-2, 33),
        ..._.range(42, 46)
      ]
    },
    secondary: {
      leave: [
        ..._.range(0, 2),
        ..._.range(29, 42)
      ],
      pay: [
        ..._.range(0, 2)
      ]
    }
  }
}

for (const [name, data] of Object.entries(examples)) {
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
