const { describe, it } = require('mocha')
const assert = require('chai').assert

const blocks = require('../../../app/lib/blocks')

const unfilledVisualPlannerJSON = require('../../data/unfilledVisualPlannerData')
const filledVisualPlannerJSON = require('../../data/filledVisualPlannerData')
const filledQuestionPlannerJSON = require('../../data/filledQuestionPlannerData')

describe('Blocks', () => {
  describe('getBlocks', () => {
    it('should retrieve only compulsory leave and pay blocks', () => {
      const expectedResults = {
        'leaveBlocks': {
          'primary': {
            'initial': { 'start': 0, 'end': 1, 'leave': 'maternity' },
            'spl': []
          },
          'secondary': {
            'initial': null,
            'spl': []
          }
        },
        'payBlocks': [
          { 'start': 0, 'end': 1, 'primary': '£432.69', 'secondary': undefined }
        ]
      }
      const results = blocks.getBlocks(unfilledVisualPlannerJSON)

      assert.equal(results.toString(), expectedResults.toString())
    })

    it('should retrieve the leave and pay blocks', () => {
      const expectedResults = {
        'leaveBlocks': {
          'primary': {
            'initial': { 'start': 0, 'end': 1, 'leave': 'maternity' },
            'spl': [
              { 'start': 3, 'end': 4, 'leave': 'shared' },
              { 'start': 8, 'end': 9, 'leave': 'shared' }
            ]
          },
          'secondary': {
            'initial': { 'start': 0, 'end': 1, 'leave': 'paternity' },
            'spl': [
              { 'start': 3, 'end': 4, 'leave': 'shared' },
              { 'start': 6, 'end': 7, 'leave': 'shared' }
            ]
          }
        },
        'payBlocks': [
          { 'start': 0, 'end': 1, 'primary': '£432.69', 'secondary': '£148.68' },
          { 'start': 3, 'end': 4, 'primary': '£148.68', 'secondary': '£148.68' },
          { 'start': 6, 'end': 7, 'primary': undefined, 'secondary': '£148.68' },
          { 'start': 8, 'end': 9, 'primary': '£148.68', 'secondary': undefined }
        ]
      }

      const results = blocks.getBlocks(filledVisualPlannerJSON)

      assert.equal(results.toString(), expectedResults.toString())
    })

    it('should retrieve leave and pay block for questionplanenr data', function () {
      const expectedResults = {
        'leaveBlocks': {
          'primary': {
            'initial': { 'start': 0, 'end': 1, 'leave': 'maternity' },
            'spl': [
              { 'start': 3, 'end': 4, 'leave': 'shared' },
              { 'start': 8, 'end': 9, 'leave': 'shared' }
            ]
          },
          'secondary': {
            'initial': { 'start': 0, 'end': 1, 'leave': 'paternity' },
            'spl': [
              { 'start': 3, 'end': 4, 'leave': 'shared' },
              { 'start': 6, 'end': 7, 'leave': 'shared' }
            ]
          }
        },
        'payBlocks': [
          { 'start': 0, 'end': 1, 'primary': '£432.69', 'secondary': '£148.68' },
          { 'start': 3, 'end': 4, 'primary': '£148.68', 'secondary': '£148.68' },
          { 'start': 6, 'end': 7, 'primary': undefined, 'secondary': '£148.68' },
          { 'start': 8, 'end': 9, 'primary': '£148.68', 'secondary': undefined }
        ]
      }

      const results = blocks.getBlocks(filledQuestionPlannerJSON)

      assert.equal(results.toString(), expectedResults.toString())
    })
  })

  describe('parseLeaveBlocks', () => {
    it('should parse leave blocks into parent leave object', () => {
      const data = {
        'primary': {
          'initial': {start: "0", leave: "maternity", end: "1"},
          'spl': { _0: {leave: "shared", start: "3", end: "4"} }
        },
        'secondary': {
          'is-taking-paternity-leave': 'yes',
          'initial': {start: '0', leave: 'paternity', end: '1'},
          'spl': {
            _0: { leave: 'shared', start: '3', end: '4'},
            _1: { leave: 'shared', start: '6', end: '7'}
          }
        },
        'spl-block-planning-order': ['primary', 'secondary', 'done']
      }

      const expectedResults = {
        'primary': {
          'initial': {start: "0", leave: "maternity", end: "1"},
          'spl': [{leave: "shared", start: "3", end: "4"}]
        },
        'secondary': {
          'initial': {start: '0', leave: 'paternity', end: '1'},
          'spl': [
            { leave: 'shared', start: '3', end: '4'},
            { leave: 'shared', start: '6', end: '7'}
          ]
        }
      }

      const results = blocks.parseLeaveBlocks(data)

      assert.equal(results.toString(), expectedResults.toString())
    })
  })
})
