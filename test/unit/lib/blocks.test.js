const { describe, it } = require('mocha')
const assert = require('chai').assert
const _ = require('lodash')

const blocks = require('../../../app/lib/blocks')
const unfilledVisualPlannerJSON = require('../../data/unfilledVisualPlannerData')
const unfilledQuestionPlannerJSON = require('../../data/unfilledQuestionPlannerData')
const filledVisualPlannerJSON = require('../../data/filledVisualPlannerData')
const filledQuestionPlannerJSON = require('../../data/filledQuestionPlannerData')
const filledQBPLargeWeeksData = require('../../data/filledQBPLargeWeeksData.json')
const filledLeaveBlocks = require('../../data/filledLeaveBlocks.json')

describe('Blocks', () => {
  describe('getBlocks', () => {
    it('should retrieve only compulsory leave and pay blocks', () => {
      const expectedResults = {
        leaveBlocks: {
          primary: {
            initial: { start: 0, end: 1, leave: 'maternity' },
            spl: []
          },
          secondary: {
            initial: null,
            spl: []
          }
        },
        payBlocks: [
          { start: 0, end: 1, primary: '£432.69', secondary: undefined }
        ]
      }
      const results = blocks.getBlocks(unfilledVisualPlannerJSON)

      assert.equal(results.toString(), expectedResults.toString())
    })

    it('should retrieve the leave and pay blocks', () => {
      const expectedResults = {
        leaveBlocks: {
          primary: {
            initial: { start: 0, end: 1, leave: 'maternity' },
            spl: [
              { start: 3, end: 4, leave: 'shared' },
              { start: 8, end: 9, leave: 'shared' }
            ]
          },
          secondary: {
            initial: { start: 0, end: 1, leave: 'paternity' },
            spl: [
              { start: 3, end: 4, leave: 'shared' },
              { start: 6, end: 7, leave: 'shared' }
            ]
          }
        },
        payBlocks: [
          { start: 0, end: 1, primary: '£432.69', secondary: '£184.03' },
          { start: 3, end: 4, primary: '£184.03', secondary: '£184.03' },
          { start: 6, end: 7, primary: undefined, secondary: '£184.03' },
          { start: 8, end: 9, primary: '£184.03', secondary: undefined }
        ]
      }

      const results = blocks.getBlocks(filledVisualPlannerJSON)

      assert.equal(JSON.stringify(results), JSON.stringify(expectedResults))
    })

    it('should retrieve only compulsory leave and pay blocks block for question planner data',
      () => {
        const expectedResults = {
          leaveBlocks: {
            primary: {
              initial: { start: 0, end: 0, leave: 'maternity' },
              spl: []
            },
            secondary: {
              initial: null,
              spl: []
            }
          },
          payBlocks: [
            { start: 0, end: 0, primary: '90% of weekly pay', secondary: undefined }
          ]
        }
        const results = blocks.getBlocks(unfilledQuestionPlannerJSON)

        assert.equal(JSON.stringify(results), JSON.stringify(expectedResults))
      })

    it('should retrieve leave and pay block for question planner data', function () {
      const expectedResults = {
        leaveBlocks: {
          primary: {
            initial: { start: 0, end: 1, leave: 'maternity' },
            spl: [
              { start: 3, end: 4, leave: 'shared' },
              { start: 8, end: 9, leave: 'shared' }
            ]
          },
          secondary: {
            initial: { start: 0, end: 1, leave: 'paternity' },
            spl: [
              { start: 3, end: 4, leave: 'shared' },
              { start: 6, end: 7, leave: 'shared' }
            ]
          }
        },
        payBlocks: [
          { start: 0, end: 1, primary: '£432.69', secondary: '£184.03' },
          { start: 3, end: 4, primary: '£184.03', secondary: '£184.03' },
          { start: 6, end: 7, primary: undefined, secondary: '£184.03' },
          { start: 8, end: 9, primary: '£184.03', secondary: undefined }
        ]
      }

      const results = blocks.getBlocks(filledQuestionPlannerJSON)

      assert.equal(JSON.stringify(results), JSON.stringify(expectedResults))
    })
  })

  describe('parseLeaveBlocks', () => {
    it('should parse leave blocks into parent leave object', () => {
      const data = {
        primary: {
          initial: { start: '0', leave: 'maternity', end: '1' },
          spl: { _0: { leave: 'shared', start: '3', end: '4' } }
        },
        secondary: {
          'is-taking-paternity-leave': 'yes',
          initial: { start: '0', leave: 'paternity', end: '1' },
          spl: {
            _0: { leave: 'shared', start: '3', end: '4' },
            _1: { leave: 'shared', start: '6', end: '7' }
          }
        },
        'spl-block-planning-order': ['primary', 'secondary', 'done']
      }

      const expectedResults = {
        primary: {
          initial: { leave: 'maternity', start: 0, end: 1 },
          spl: [{ leave: 'shared', start: 3, end: 4 }]
        },
        secondary: {
          initial: { leave: 'paternity', start: 0, end: 1 },
          spl: [
            { leave: 'shared', start: 3, end: 4 },
            { leave: 'shared', start: 6, end: 7 }
          ]
        }
      }

      const results = blocks.parseLeaveBlocks(data)

      assert.equal(JSON.stringify(results), JSON.stringify(expectedResults))
    })
  })

  describe('parseLeaveBlocksIntoLeaveAndPay', () => {
    it('should parse the question based planner leave blocks the same as visual planner', () => {
      const expectedResults = {
        'nature-of-parenthood': 'birth',
        primary: {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '25000',
          'salary-period': 'year',
          leave: [
            '0',
            '1',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '23',
            '24',
            '25',
            '26'
          ],
          pay: [
            '0',
            '1',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21'
          ]
        },
        secondary: {
          'spl-eligible': 'yes',
          'shpp-eligible': 'yes',
          'salary-amount': '25000',
          'salary-period': 'year',
          leave: [
            '0',
            '1',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20'
          ],
          pay: [
            '0',
            '1',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20'
          ]
        },
        'start-date-day': '1',
        'start-date-month': '1',
        'start-date-year': '2020',
        'leave-blocks': '',
        visualPlanner: false
      }
      expectedResults['leave-blocks'] = filledQBPLargeWeeksData['leave-blocks']

      const data = _.cloneDeep(filledQBPLargeWeeksData)
      const leaveBlock = _.cloneDeep(data['leave-blocks'])

      blocks.parseLeaveBlocksIntoLeaveAndPay(data, leaveBlock)

      assert.equal(JSON.stringify(data), JSON.stringify(expectedResults))
    })
  })

  describe('getRemainingLeaveAllowance', () => {
    it('should calculate the amount of leave left', () => {
      const result = blocks.getRemainingLeaveAllowance(filledLeaveBlocks)

      assert.equal(result, 42)
    })
  })

  describe('getRemainingPayAllowance', () => {
    it('should calculate the amount of pay left', () => {
      const result = blocks.getRemainingPayAllowance(filledLeaveBlocks)

      assert.equal(result, 29)
    })
  })
})
